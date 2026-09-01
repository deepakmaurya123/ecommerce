from langchain.agents import create_agent
from .langchain_tools import get_order_details, get_refund_history, check_delivery_status, search_knowledge_base
from .agents import SUPPORT_SYSTEM_PROMPT
from langgraph.checkpoint.memory import InMemorySaver

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Initialise Groq Agent
load_dotenv()

llm = ChatGroq(model=os.getenv("GROQ_MODEL"), groq_api_key=os.getenv("GROQ_API_KEY"))



SUPPORT_TOOLS = [get_order_details, get_refund_history, check_delivery_status, search_knowledge_base]  # It will told to LLM, these functions are available to call.

checkpointer = InMemorySaver()

support_agent = create_agent(
    model=llm,
    tools=SUPPORT_TOOLS,
    system_prompt=SUPPORT_SYSTEM_PROMPT,
    checkpointer=checkpointer,
)

def run_support_langchain(user_message, conversation_id, order_id, user_id):
    config = {"configurable": {"thread_id": str(conversation_id)}}

    contextual_message = f"[Context: This conversation is about Order #{order_id}, user: {user_id}] {user_message}"

    result = support_agent.invoke(
        {"messages": [{"role": "user", "content": contextual_message}]},
        config=config,
    )
    final_text = result["messages"][-1].content
    return final_text