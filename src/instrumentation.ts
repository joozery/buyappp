export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initDiscordBot } = await import("@/lib/discordBot");
      await initDiscordBot();
    } catch {
      // Discord bot disabled — no token configured
    }
  }
}
