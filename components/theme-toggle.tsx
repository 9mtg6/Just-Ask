<div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          
          {user ? (
            <>
              {/* جرس الإشعارات */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/50">
                    <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    {/* النقطة الحمراء للدلالة على وجود إشعارات جديدة (يمكنك التحكم فيها برمجياً لاحقاً) */}
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 rounded-xl p-4 shadow-2xl border-white/10 backdrop-blur-md bg-card/95">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Notifications</h4>
                    <span className="text-xs text-primary cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* أمثلة للإشعارات لحين ربطها بقاعدة البيانات */}
                    <div className="text-sm p-3 rounded-lg bg-secondary/50 border border-white/5">
                      <span className="font-semibold text-primary">Yassin</span> answered your question about "Physics 101".
                      <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                    </div>
                    <div className="text-sm p-3 rounded-lg bg-secondary/50 border border-white/5">
                      Your question reached <strong>10 upvotes</strong>! 🎉
                      <div className="text-xs text-muted-foreground mt-1">1 day ago</div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {role === 'student' && (
// ... باقي الكود الخاص بالأزرار كما هو