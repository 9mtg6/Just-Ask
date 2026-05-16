// بعد ما السؤال يتحفظ بنجاح:
// const { data: newQuestion, error } = await supabase.from("questions").insert({...}).select().single()

// أضف ده:
if (newQuestion) {
  // Fire and forget — مش هنستنى الإجابة عشان منبطئش الـ response
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: newQuestion.id,
      questionTitle: newQuestion.title,
      questionBody: newQuestion.body,
      category: newQuestion.category_name, // أو أي field بيحمل اسم الماتيريال
    }),
  }).catch(console.error); // مش هنحط await عشان يشتغل في الـ background
}