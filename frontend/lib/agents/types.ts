export interface AgentResponse {
    content: string;
    metadata?: any;
}

export interface Agent {
    name: string;
    description: string;
    expertise: string[];
    process(input: string, context?: any): Promise<AgentResponse>;
}
