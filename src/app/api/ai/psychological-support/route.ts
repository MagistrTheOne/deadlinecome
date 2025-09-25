import { NextRequest, NextResponse } from "next/server";
import { PsychologicalSupport } from "@/lib/ai/psychological-support";
import { TeamMoodMonitor } from "@/lib/ai/team-mood-monitor";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = PsychologicalSupport.getSupportStats();
        return NextResponse.json(stats);

      case "profiles":
        const profiles = PsychologicalSupport.getAllUserProfiles();
        return NextResponse.json(profiles);

      case "crises":
        const crises = PsychologicalSupport.getActiveCrises();
        return NextResponse.json(crises);

      case "recommendations":
        const recommendations = PsychologicalSupport.getTeamAtmosphereRecommendations();
        return NextResponse.json({ recommendations });

      case "daily-motivation":
        const dailyMotivation = PsychologicalSupport.generateDailyMotivation();
        return NextResponse.json({ messages: dailyMotivation });

      default:
        return NextResponse.json({
          stats: PsychologicalSupport.getSupportStats(),
          activeCrises: PsychologicalSupport.getActiveCrises(),
          recommendations: PsychologicalSupport.getTeamAtmosphereRecommendations()
        });
    }
  } catch (error) {
    console.error("Ошибка получения данных психологической поддержки:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных психологической поддержки" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "analyze-and-support":
        const { userId, context } = data;
        const supportMessages = PsychologicalSupport.analyzeAndSupport(userId, context);
        return NextResponse.json({
          success: true,
          messages: supportMessages,
          message: `Сгенерировано ${supportMessages.length} сообщений поддержки`
        });

      case "update-profile":
        const { userId: profileUserId, updates } = data;
        PsychologicalSupport.updateUserProfile(profileUserId, updates);
        return NextResponse.json({
          success: true,
          message: "Профиль пользователя обновлен"
        });

      case "initialize-profile":
        const { userId: initUserId, userName } = data;
        const profile = PsychologicalSupport.initializeUserProfile(initUserId, userName);
        return NextResponse.json({
          success: true,
          profile,
          message: "Профиль пользователя инициализирован"
        });

      case "resolve-crisis":
        const { crisisId, resolutionActions } = data;
        const resolved = PsychologicalSupport.resolveCrisis(crisisId, resolutionActions);
        return NextResponse.json({
          success: resolved,
          message: resolved ? "Кризисная ситуация разрешена" : "Кризисная ситуация не найдена"
        });

      case "add-message":
        const { userId: messageUserId, userName, content, channel } = data;
        const teamMessage = TeamMoodMonitor.addMessage({
          userId: messageUserId,
          userName,
          content,
          channel,
          type: "text"
        });
        return NextResponse.json({
          success: true,
          message: teamMessage,
          message: "Сообщение добавлено для анализа настроения"
        });

      case "get-team-mood":
        const teamMoodReport = TeamMoodMonitor.getTeamMoodReport();
        return NextResponse.json({
          success: true,
          report: teamMoodReport
        });

      case "get-user-mood":
        const { userId: moodUserId } = data;
        const userMood = TeamMoodMonitor.getUserMood(moodUserId);
        return NextResponse.json({
          success: true,
          mood: userMood
        });

      case "get-mood-stats":
        const moodStats = TeamMoodMonitor.getMoodStats();
        return NextResponse.json({
          success: true,
          stats: moodStats
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки психологической поддержки:", error);
    return NextResponse.json(
      { error: "Ошибка обработки психологической поддержки" },
      { status: 500 }
    );
  }
}
