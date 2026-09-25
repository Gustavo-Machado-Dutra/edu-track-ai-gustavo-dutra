import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CurrentUser } from "../../auth/current-user.decorator";
import { AgentOrchestratorService } from "./agent-orchestrator.service";

interface ChatRequest {
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  conversationId: string;
  response: {
    type: string;
    content: unknown;
  };
}

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  @Post("chat")
  @HttpCode(HttpStatus.OK)
  async chat(@CurrentUser() user: { id: string }, @Body() body: ChatRequest): Promise<ChatResponse> {
    const userId = user.id;
    const { message, conversationId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return {
        conversationId: conversationId ?? "",
        response: {
          type: "text",
          content: "Message cannot be empty",
        },
      };
    }

    const result = await this.orchestrator.execute(userId, message.trim(), conversationId);

    return {
      conversationId: result.conversationId,
      response: {
        type: result.response.type,
        content: result.response.content,
      },
    };
  }
}