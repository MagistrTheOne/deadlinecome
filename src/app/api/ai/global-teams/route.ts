import { NextRequest, NextResponse } from "next/server";
import { GlobalTeamsInstance } from "@/lib/ai/global-teams";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const region = searchParams.get("region");

    switch (action) {
      case "languages":
        const languages = GlobalTeamsInstance.getSupportedLanguages();
        return NextResponse.json({ languages });

      case "members":
        const members = GlobalTeamsInstance.getGlobalMembers();
        return NextResponse.json({ members });

      case "status":
        const status = await GlobalTeamsInstance.getGlobalTeamStatus();
        return NextResponse.json(status);

      case "cultural-guidelines":
        if (!region) {
          return NextResponse.json(
            { error: "region обязателен" },
            { status: 400 }
          );
        }
        const guidelines = await GlobalTeamsInstance.getCulturalGuidelines(region);
        return NextResponse.json({ guidelines });

      case "language-stats":
        const languageStats = GlobalTeamsInstance.getLanguageStats();
        return NextResponse.json(languageStats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка global teams:", error);
    return NextResponse.json(
      { error: "Ошибка global teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, fromLanguage, toLanguage, context, targetCulture, communicationType, participants, duration, preferences, member } = body;

    switch (action) {
      case "translate":
        if (!message || !fromLanguage || !toLanguage) {
          return NextResponse.json(
            { error: "message, fromLanguage и toLanguage обязательны" },
            { status: 400 }
          );
        }
        const translation = await GlobalTeamsInstance.translateMessage(message, fromLanguage, toLanguage, context);
        return NextResponse.json(translation);

      case "adapt-communication":
        if (!message || !targetCulture || !communicationType) {
          return NextResponse.json(
            { error: "message, targetCulture и communicationType обязательны" },
            { status: 400 }
          );
        }
        const adaptation = await GlobalTeamsInstance.adaptCommunication(message, targetCulture, communicationType);
        return NextResponse.json(adaptation);

      case "schedule-meeting":
        if (!participants || !duration) {
          return NextResponse.json(
            { error: "participants и duration обязательны" },
            { status: 400 }
          );
        }
        const meeting = await GlobalTeamsInstance.scheduleGlobalMeeting(participants, duration, preferences);
        return NextResponse.json(meeting);

      case "add-member":
        if (!member) {
          return NextResponse.json(
            { error: "member обязателен" },
            { status: 400 }
          );
        }
        const memberId = await GlobalTeamsInstance.addGlobalMember(member);
        return NextResponse.json({ memberId });

      case "update-timezone":
        if (!body.memberId || !body.newTimezone) {
          return NextResponse.json(
            { error: "memberId и newTimezone обязательны" },
            { status: 400 }
          );
        }
        await GlobalTeamsInstance.updateMemberTimezone(body.memberId, body.newTimezone);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка global teams:", error);
    return NextResponse.json(
      { error: "Ошибка global teams" },
      { status: 500 }
    );
  }
}
