import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { questionId, questionTitle, questionBody, category } =
      await request.json();

    if (!questionId || !questionTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. اطلب إجابة من Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `أنت مساعد أكاديمي متخصص لطلاب جامعة E-JUST.
التخصص: ${category || "عام"}
السؤال: ${questionTitle}
${questionBody || ""}

أجب بشكل واضح ومفيد، واستخدم نفس لغة السؤال (عربي أو إنجليزي).`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const aiAnswerText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiAnswerText) {
      throw new Error("No answer received from AI");
    }

    // 2. احفظ الإجابة في Supabase
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("answers")
      .insert({
        question_id: questionId,
        content: aiAnswerText,
        is_ai: true,
      })
      .select()
      .single();

    if (error) throw new Error("Failed to save AI answer");

    return NextResponse.json({ success: true, answer: data });
  } catch (error) {
    console.error("AI Answer Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI answer" },
      { status: 500 }
    );
  }
}