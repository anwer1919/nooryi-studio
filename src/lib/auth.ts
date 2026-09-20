    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        const email = user?.email?.toLowerCase()
        if (!email) return false
        let dbUser = await prisma.user.findUnique({ where: { email } })
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: { email, name: user.name || email.split("@")[0], password: "oauth-no-password", role: "USER", otpVerified: true },
          })
        } else {
          // ═══ تحديث otpVerified في قاعدة البيانات ═══
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { otpVerified: true },
          }).catch(() => {})
        }
        user.id = dbUser.id
        user.role = dbUser.role
        user.phone = dbUser.phone
        user.artistId = dbUser.artistId
        user.otpVerified = true
      }
      return true
    },
