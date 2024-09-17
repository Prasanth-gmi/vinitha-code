from textwrap import dedent
from crewai import Agent

from langchain.llms import Ollama
from langchain_groq import ChatGroq

class Agents:
    def __init__(self):
        self.custom_agents = {}
        self.available_models = {
            "ollama": [
                "llama3-8b-8192",
                "phi3:latest",
                "llama2:latest",
                "mistral:latest",
                "orca2:latest",
                "vicuna:latest"
            ],
           "chatgroq": [
               "llama3-8b-8192",
               "phi3:latest",
               "mistral:latest",
                "mixtral-8x7b-instruct-32768",
                "llama2-70b-4096"
            ]
        }
            

    def stakeholder_agent(self, llm, topic):
        return Agent(
            role="Stakeholder",
            goal=f"Ensure the project meets business goals and stakeholder expectations {topic}",
            backstory=dedent(
                """\
				You are the main stakeholder in the project. Your role is to ensure that the project aligns with the business goals and meets the expectations of all stakeholders."""
            ),
            
            llm=llm,
            verbose=True,
        )

    def business_analyst_agent(self, llm, topic):
        return Agent(
            role="Business Analyst",
            goal=f"Analyze business requirements and processes for {topic}",
            backstory=dedent(
                """
                You are a skilled business analyst with expertise in analyzing business processes,
                identifying requirements, and bridging the gap between stakeholders and the technical team.
                Your role is to ensure that business needs are properly translated into project requirements.
                """
            ),
            llm=llm,
            verbose=True,
        )

    def product_owner_agent(self, llm, topic):
        return Agent(
            role="Product Owner",
            goal=f"Define the product vision and prioritize the product backlog  {topic}",
            backstory=dedent(
                """\
				You are the Product Owner responsible for defining the product vision and prioritizing the product backlog to ensure the development team delivers the most valuable features first."""
            ),
            llm=llm,
            verbose=True,
            # tools=[exa_tool],
        )

    def scrum_master_agent(self, llm, topic):
        return Agent(
            role="Scrum Master",
            goal=f"Facilitate Scrum practices and remove impediments for the team  {topic}",
            backstory=dedent(
                """\
				You are the Scrum Master. Your role is to facilitate Scrum practices, ensure the team adheres to Scrum principles, and remove any impediments that may hinder the team’s progress."""
            ),
            llm=llm,
            verbose=True,
        )

    def designer_agent(self, llm, topic):
        return Agent(
            role="Designer",
            goal=f"""Generate a HTML file that contains mobile-friendly wireframes for a {topic} using only HTML and CSS.""",
            backstory=dedent(
                """\An experienced Designer with a strong background in UI/UX Design, specializing in translating HTML/CSS specifications into visual designs."""
            ),
            llm=llm,
            verbose=True,
        )

    def developer_agent(self, llm, topic):
        return Agent(
            role="Developer",
            goal=f"Write high-quality code that meets the project specifications  {topic}",
            backstory=dedent(
                """\
				You are a Developer. Your role is to write high-quality code that meets the project specifications and contributes to the overall success of the project."""
            ),
            allow_code_execution=True,
            allow_delegation=True,
            llm=llm,
            # tools=[search_tool,exa_tool],
            verbose=True,
        )

    def tester_agent(self, llm, topic):
        return Agent(
            role="Tester",
            goal=f"Test the software to ensure it is free of bugs and meets the requirements {topic}",
            backstory=dedent(
                """\
				You are a Tester. Your role is to test the software thoroughly to ensure it is free of bugs and meets the project requirements."""
            ),
            allow_delegation=True,
            llm=llm,
            verbose=True,
        )

    def create_custom_agent(self, name, role, goal, backstory, llm_type, model_name, api_key=None):
        if llm_type == "ollama":
            llm = Ollama(model=model_name)
        elif llm_type == "chatgroq":
            llm = ChatGroq(api_key=api_key, model=model_name)
        else:
            raise ValueError(f"Unsupported LLM type: {llm_type}")

        new_agent = Agent(
            role=role,
            goal=goal,
            backstory=dedent(
                f"""\
                You are {name}. Your role is to {role} and contribute to the overall success of the project. 
                Your goal is to {goal}. Here is your backstory: {backstory}"""
            ),
            allow_delegation=True,
            verbose=True,
            llm=llm,
        )
        self.custom_agents[name] = new_agent
        return new_agent

    def get_agent_by_name(self, name):
        return self.custom_agents.get(name)

    def save_agent(self, agent):
        self.custom_agents[agent.role] = agent

    def get_available_models(self):
        return self.available_models

   
