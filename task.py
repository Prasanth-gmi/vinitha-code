from typing import Self
from crewai import Task
from textwrap import dedent



from crewai_tools import FileReadTool
from crewai_tools import SerperDevTool
import os





os.environ["SERPER_API_KEY"] = "17ba5f7cdca5e20b453d8fb2a6231026ce47e345"
search_tool = SerperDevTool()









class Tasks:
    def __init__(self):
        self.custom_tasks = {}
        self.tasks = []

    def stakeholder_task(self, agent, topic):

        return Task(
            description=f"Provide initial high-level requirements for {topic}.",
            expected_output="""A detailed document outlining:
                1. Introduction for the project: Overview, objectives, and the rationale behind the project.
                2. Overview of the system: High-level description of the system architecture and main components.
                3. Purpose and scope of the project: Clearly defined goals and boundaries of the project.
                4. Target audience and users: Identification of the primary users and stakeholders.
                5. High-level features and benefits: Summary of the key features and the expected benefits they will bring.
               """,
            output_file="outs/Stakeholder.md",
            
            verbose=True,
            agent=agent,
        )

    def business_analyst_task(self, agent, topic):
        return Task(
            description=f"Conduct a comprehensive business requirements analysis for {topic}.",
            expected_output="""A detailed document outlining:
                1. Executive summary: Brief overview of the business requirements analysis.
                2. Project background: Context and reasons for undertaking the project.
                3. Business objectives: Clear statement of what the business aims to achieve with this project.
                4. Stakeholder analysis: Identification and analysis of all stakeholders involved or affected by the project.
                5. Current business process: Detailed description of the current process or system (if applicable).
                6. Problem statement: Clear definition of the business problem or opportunity being addressed.
                7. Proposed solution: High-level description of the proposed solution.
                8. Functional requirements: Detailed list and description of all functional requirements.
                9. Non-functional requirements: List of all non-functional requirements (e.g., performance, security, scalability).
                10. Constraints and assumptions: Any constraints or assumptions that may impact the project.
                11. Risk analysis: Identification and assessment of potential risks and mitigation strategies.
                12. Success criteria: Clear, measurable criteria for determining project success.
                13. Glossary: Definitions of key terms and concepts used in the document.
            """,
            output_file="outs/business_analyst.md",
            agent=agent,
        )


    def product_owner_task(self, agent, topic):
        return Task(
            description=f"Create and prioritize the product backlog based on stakeholder requirements for {topic}.",
            expected_output="""A prioritized product backlog document containing:
                1. Requirement Analysis:
                    - Detailed understanding of each requirement.
                    - Well-documented requirements with user stories and acceptance criteria.
                2. Prioritization:
                    - A clear priority ranking based on stakeholder input and business value.
                    - Justification for the prioritization decisions.
                3. Refinement:
                    - Breakdown of high-level requirements into actionable tasks.
                    - Clearly defined acceptance criteria for each task.
                4. Backlog Update:
                    - Regularly updated product backlog reflecting the current state of the project.
                    - Well-groomed backlog with clearly defined priorities and tasks.
                5. Release Planning:
                    - Coordination with stakeholders to align on release timelines.
                    - Updated documentation reflecting release plans and progress.
                 """,
            output_file="outs/product_owner.md",
            agent=agent,
        )

    def scrum_master_task(self, agent, topic):
        return Task(
            description=f"Facilitate sprint planning and ensure the team adheres to Scrum practices for {topic}.",
            expected_output="""A comprehensive report on sprint planning and Scrum practices, including:
                1. Requirement Clarification:
                    - Detailed discussions and clarifications on requirements.
                    - Well-documented acceptance criteria for each user story.
                2. Documentation:
                    - Complete and clear user stories with all necessary details.
                    - Updated backlog with prioritized user stories.
                3. Prioritization:
                    - Refined backlog with prioritized tasks for the sprint.
                    - Clear criteria for prioritizing tasks.
                4. Sprint Planning:
                    - Detailed sprint planning meeting notes.
                    - Task breakdown and allocation for the sprint.
                5. Task Assignment:
                    - Clear task assignments with deadlines.
                    - Updated sprint board reflecting task assignments.
                6. Implementation:
                    - Documentation of daily stand-ups and progress updates.
                    - Notes on any impediments and resolutions.
                7. Review:
                    - Comprehensive code review reports.
                    - Feedback and suggestions for improvement.
                 """,
            output_file="outs/scrum_master.md",
            agent=agent,
        )

    def designer_task_html(self, agent, topic):
        return Task(
            description=f"""Generate a single HTML file containing mobile wireframes for a ${topic} application.""",
            expected_output=f"""
                 Create a well-structured HTML file with mobile wireframes for a ${topic} application, adhering to the following specifications:

                
                1. Structure:
                - Wrap all content in a \`<div id="designer-wireframe">\` element.
                - Create at least six \`<div class="mobile-frame">\` elements within the wrapper.
                - Each \`<div class="mobile-frame">\` should represent a different screen relevant to the ${topic} application.
                - Always include Register and Login screens.
                - The remaining screens should be specifically tailored to the ${topic}.

                2. Content:
                - Register Screen: Include fields relevant to the {topic} (e.g., username, email, password, and any topic-specific fields).
                - Login Screen: Include standard login fields and any {topic}-specific login options.
                - Home Screen (Dashboard): 
                    * Display a summary or overview specifically relevant to the {topic}.
                    * Include quick action buttons or links to main features of the {topic} application.
                    * Ensure the design is attractive and user-friendly for the specify {topic} applications.
                - Additional Screens: Create at least seven more screens specific to the {topic} functionality.

                3. Navigation:
                - Use `<header>` for the top bar with screen titles.
                - Use `<main>` for the primary content area.
                - Include `<section>` tags to group related content within each screen.
                - Utilize form elements like `<input>`, `<button>`, and `<label>` where necessary.
                
                - Include icons for home, list view, profile, and other topic-specific sections.
                
                4. Style Link:
                - Include a `<link>` tag in the `<head>` section of the HTML file to link to the external CSS file: `<link rel="stylesheet" href="designer_output.css">`.

               5. Class Names:
                - Prefix all class names with 'dw-' (for "designer wireframe") to avoid conflicts.
                - Use descriptive class names like 'dw-mobile-frame', 'dw-button', 'dw-input-field', etc.

                6. Comments:
                - Include detailed comments in the HTML explaining each section and any complex layout choices.
                - Add comments suggesting potential variations or additional features specific to the {topic}.

                The final output should be a single HTML file that, when opened in a browser and linked with the CSS file, displays a structured mobile wireframe for the {topic} application.
                """,
            output_file="outs/designer_output.html",
            # tools = [main,read_content,write_content,clean_html],
            agent=agent,
        )

    def designer_task_css(self, agent, topic, context=None):
        return Task(
            description=f"Generate a CSS file to style the HTML wireframes for a {topic} application.",
            expected_output=f"""
            Create a well-structured CSS file to style the HTML wireframes for a {topic} application, adhering to the following specifications:

            1. Scope:
            - Wrap all styles within a '#designer-wireframe' selector to isolate them from the rest of the frontend.

            2. General Styling:
            - Use the `box-sizing: border-box;` property for all elements within #designer-wireframe.
            - Reset margin and padding to zero for all elements within #designer-wireframe.

            3. App Container:
            - Style the #designer-wireframe element instead of body:
                #designer-wireframe {{
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #f4f4f4;
                    padding: 20px;
                    margin:0;
                    color:black;
                }}

            4. Mobile Frame:
            - Define a .dw-mobile-frame class with:
                .dw-mobile-frame {{
                    width: 360px;
                    height: 640px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    background-color: #fff;
                    margin: 10px;
                    padding: 20px;
                    
                    box-sizing: border-box;
                    overflow-y: auto;
                }}

            5. Layout Styles:
            - Style the `header` with a background color (#4CAF50), white text color, and centered text.
            - Style the `main` and `section` elements with padding and background colors. Add shadows and borders for separation.

            6. Navigation:
            - Style `.nav-menu` to be fixed at the bottom of the viewport with a background color (#4CAF50) and centered text.
            - Style navigation links with white text and include hover effects.

            7. Buttons:
            - Style `.button` with a green background, text  black, padding, border-radius, and hover effects.

            8. Form Elements:
            - Style form elements (`input`, `select`, etc.) with consistent padding, margin, border, and border-radius.

            9. Color Scheme:
            - Define CSS variables for --at-color-primary (#4CAF50) and --at-color-secondary (#ccc).

            10. Responsive Design:
            - Implement a media query for screens with a maximum width of 768px:
                @media (min-width: 768px) {{
                    #designer-wireframe .dw-mobile-frame {{
                         width: 360px;
                        height: 640px;
                        border: none;
                        box-shadow: none;
                    }}
                }}

            11. Comments:
            - Include comments in the CSS file to explain the styling choices and any complex layout decisions.

            The final CSS file should be linked to the HTML and provide a well-styled and functional mobile wireframe for the {topic} application.
            """,
            output_file="outs/designer_output.css",
            context=[context],
            # tools = [main, read_content, write_content, clean_css],
            agent=agent,
        )

    def backend_developer_task(self, agent, topic):
        return Task(
            description=f"Develop full code backend functionalities for {topic}.",
            expected_output="""Fully functional backend code including:
                1. API Endpoints:
                    - User authentication endpoints (registration, login, logout).
                    - CRUD operations for primary entities related to the project.
                    - Pagination, filtering, and sorting for data retrieval endpoints.
                2. Database Integration:
                    - Properly defined models and relationships.
                    - Use of ORM or direct database queries for data operations.
                    - Implementation of data validation and constraints.
                3. Unit and Integration Tests:
                    - Tests for each API endpoint using the project's testing framework.
                    - Mocking of external services or dependencies where applicable.
                    - Code coverage reports to ensure comprehensive test coverage.
                4. Documentation:
                    - Detailed API documentation.
                    - Setup and usage instructions for the backend system.""",
            output_file="outs/backend_developer.md",
            agent=agent,
            # human_input=True
        )

    def tester_task(self, agent, topic):
        return Task(
            description=f"Test the project to ensure it meets quality standards for {topic}.",
            expected_output="""Comprehensive test reports including and the output is  color full like Heading in one color and sub Heading in one color and add  point symbols and 
                the Heading bold output :
                1. Test Cases:
                    - Detailed test cases for functional and non-functional requirements.
                    - Coverage of all critical scenarios and edge cases.
                2. Test Execution:
                    - Execution results for each test case.
                    - List of identified bugs with detailed descriptions and steps to reproduce.
                3. Bug Reports:
                    - Prioritized list of bugs with severity and impact analysis.
                    - Recommendations for fixing the identified issues.
                4. Test Summary:
                    - Overall quality assessment of the project.
                    - Summary of testing activities and results.
                5. Regression Testing:
                    - Results of regression tests to ensure new changes do not introduce new issues.
                6. Final Quality Report:
                    - Comprehensive report summarizing all testing activities and findings.""",
            output_file="outs/tester.md",
            agent=agent,
        )

   
    def create_custom_task(self, agent, description, expected_output, output_file, tools):
  
     for tool in tools:
        if not hasattr(tool, '_run') or not callable(getattr(tool, '_run')):
            raise ValueError(f"Tool {tool.__class__.__name__} is missing the required '_run' method implementation.")

 
        new_task = Task(
            agent=agent,
            description=description,
            expected_output=expected_output,
            output_file=output_file,
            tools=tools,
        )
        self.tasks.append(new_task)
        return new_task 

    def get_task_by_description(self, description):
        for task in self.tasks:
            if task.description == description:
                return task
        return None
