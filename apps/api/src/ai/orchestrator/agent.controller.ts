import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AgentOrchestratorService } from "./agent-orchestrator.service";
interface UserPayload { sub: string; email: string; }

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
  async chat(@Request() req: { user: UserPayload }, @Body() body: ChatRequest): Promise<ChatResponse> {
    const userId = req.user.sub;
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
