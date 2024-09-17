import traceback
from fastapi import FastAPI, Form, HTTPException, status, Query
from fastapi.responses import (
    HTMLResponse,
    PlainTextResponse,
    FileResponse,
    JSONResponse,
)
from fastapi.staticfiles import StaticFiles

from crewai import Crew
from langchain_community.llms import Ollama

from langchain_groq import ChatGroq
from agent import Agents
from task import Tasks
import httpx
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from typing import Optional

from datetime import datetime

import time

import re
import os
import logging
import traceback

from io import BytesIO
from docx import Document
from crewai_tools import SerperDevTool, FileReadTool

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()





app.add_middleware(
    CORSMiddleware,
      allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


agents = Agents()
tasks = Tasks()

my_llm = ChatGroq(
    api_key="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",
    model="llama3-8b-8192",
)




def handle_exception(e: Exception):
    logger.error(f"An error occurred: {str(e)}")
    logger.error(traceback.format_exc())
    return HTTPException(status_code=500, detail=str(e))



async def process_topic(
    endpoint: str, topic: str, method: str = "GET", timeout: float = 30.0
):
    url = f"http://localhost:8080{endpoint}"

    params = {"topic": topic}

    try:
        async with httpx.AsyncClient() as client:
            if method.upper() == "GET":
                response = await client.get(url, params=params, timeout=timeout)
            elif method.upper() == "POST":
                response = await client.post(url, data=params, timeout=timeout)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            result = response.text
            return result
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"HTTP error: {e.response.status_code} - {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Request error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing topic: {str(e)}",
        )




@app.get("/stakeholder/", response_class=HTMLResponse)
async def get_stakeholder_task_page():
    return FileResponse("outs/stakeholder.md")


@app.post("/stakeholder/")
async def stakeholder_task_api(topic: str = Form(...)):
    try:
        stakeholder_agent = agents.stakeholder_agent(my_llm, topic)
        stakeholder_task = tasks.stakeholder_task(stakeholder_agent, topic)
        
        crew = Crew(agents=[stakeholder_agent], tasks=[stakeholder_task], verbose=True)
        result = crew.kickoff()
        
     
        result_string = result.result if hasattr(result, 'result') else str(result)
        
        result_string = result_string.replace("**", "").replace("*", "")
        with open("outs/stakeholder.md", "w") as f:
            f.write(result_string)
        
        return PlainTextResponse(content=result_string)
    except Exception as e:
        raise handle_exception(e)


@app.get("/business_analyst/", response_class=HTMLResponse)
async def get_business_analyst_task_page():
    return FileResponse("outs/business_analyst.md")


@app.post("/business_analyst/")
async def business_analyst_task_api(topic: str = Form(...)):
    try:
        stakeholder_response = await process_topic("/stakeholder/", topic, method="GET")
        business_analyst_agent = agents.business_analyst_agent(my_llm, topic)
        business_analyst_task = tasks.business_analyst_task(
            business_analyst_agent, topic
        )

        crew = Crew(
            agents=[business_analyst_agent],
            tasks=[business_analyst_task],
            verbose=True,
        )

        result = crew.kickoff()

        # Extract the string content from the CrewOutput object
        if isinstance(result, str):
            result_string = result
        elif hasattr(result, 'result'):
            result_string = result.result
        else:
            result_string = str(result)

        # Now apply the replace method to the string
        result_string = result_string.replace("**", "").replace("*", "")

        with open("outs/business_analyst.md", "w") as f:
            f.write(result_string)

        return PlainTextResponse(
            content=f"\n{result_string}\n\nStakeholder Result:\n{stakeholder_response}"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Business analyst task error: {str(e)}",
        )
@app.get("/product_owner/", response_class=HTMLResponse)
async def get_product_owner_task_page():
    return FileResponse("outs/product_owner.md")


@app.post("/product_owner/")
async def product_owner_task_api(topic: str = Form(...)):
    try:
        product_owner_agent = agents.product_owner_agent(my_llm, topic)
        product_owner_task = tasks.product_owner_task(product_owner_agent, topic)

        crew = Crew(
            agents=[product_owner_agent],
            tasks=[product_owner_task],
            verbose=True,
        )

        crew_output = crew.kickoff()
        
       
        if hasattr(crew_output, 'result'):
            result = crew_output.result
        elif hasattr(crew_output, 'get_result'):
            result = crew_output.get_result()
        else:
            result = str(crew_output) 

        result = result.replace("**", "").replace("*", "")

        with open("outs/product_owner.md", "w") as f:
            f.write(result)

        business_analyst_response = await process_topic("/business_analyst/", topic, method="POST")

        return PlainTextResponse(
            content=f"\n{result}\n\n  business_analyst Result:\n{business_analyst_response}"
        )

    except AttributeError as e:
        logger.error(f"AttributeError in product_owner_task_api: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CrewOutput: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error in product_owner_task_api: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Product owner task error: {str(e)}",
        )
@app.get("/scrum_master/", response_class=HTMLResponse)
async def get_scrum_master_task_page():
    return FileResponse("outs/scrum_master.md")


@app.post("/scrum_master/")
async def scrum_master_task_api(topic: str = Form(...)):
    try:
        scrum_master_agent = agents.scrum_master_agent(my_llm, topic)
        scrum_master_task = tasks.scrum_master_task(scrum_master_agent, topic)

        crew = Crew(
            agents=[scrum_master_agent],
            tasks=[scrum_master_task],
            verbose=True,
        )

        crew_output = crew.kickoff()
      
        if hasattr(crew_output, 'result'):
            result = crew_output.result
        elif hasattr(crew_output, 'get_result'):
            result = crew_output.get_result()
        else:
            result = str(crew_output) 

        if isinstance(result, str):
            result = result.replace("**", "").replace("*", "")
        else:
            logger.warning(f"Unexpected result type: {type(result)}")

        with open("outs/scrum_master.md", "w") as f:
            f.write(str(result)) 

        try:
            product_owner_response = await process_topic(
                "/product_owner/", topic, method="POST" 
            )
        except HTTPException as e:
            logger.error(f"Error fetching product owner response: {str(e)}")
            product_owner_response = f"Error: {e.detail}"

        return PlainTextResponse(
            content=f"\n{result}\n   \nProduct Owner Result:\n{product_owner_response}"
        )

    except AttributeError as e:
        logger.error(f"AttributeError in scrum_master_task_api: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CrewOutput: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error in scrum_master_task_api: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scrum master task error: {str(e)}",
        )

@app.post("/designer/")
async def generate_design(topic: str = Form(...)):
    try:
        try:
            scrum_master_response = await process_topic(
                "/scrum_master/", topic, method="POST"  
            )
        except HTTPException as e:
            logger.error(f"Error fetching scrum master response: {str(e)}")
            scrum_master_response = f"Error: {e.detail}"

        designer_agent = agents.designer_agent(my_llm, topic)
        design_uiux_task1 = tasks.designer_task_html(designer_agent, topic)
        design_uiux_task2 = tasks.designer_task_css(
            designer_agent, topic, design_uiux_task1
        )

        crew = Crew(
            agents=[designer_agent],
            tasks=[design_uiux_task1, design_uiux_task2],
            verbose=True,
        )

        try:
            crew_output = crew.kickoff()
            logger.info(f"Crew kickoff result: {crew_output}")

        
            if hasattr(crew_output, 'result'):
                result = crew_output.result
            elif hasattr(crew_output, 'get_result'):
                result = crew_output.get_result()
            else:
                result = str(crew_output)  

            if not result:
                raise ValueError("Empty result from crew kickoff")

        except Exception as e:
            logger.error(f"Error during crew kickoff: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error during crew kickoff: {str(e)}"
            )

        html_file_path = "outs/designer_output.html" 
        css_file_path = "outs/designer_output.css" 

        try:
            with open(html_file_path, "r") as f:
                html_content = f.read()

            with open(css_file_path, "r") as f:
                css_content = f.read()

            return {
                "result": {
                    "html_content": html_content,
                    "css_content": css_content,
                    "scrum_master_response": scrum_master_response
                }
            }
        except FileNotFoundError as e:
            logger.error(f"File not found: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Design output files not found: {str(e)}"
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in generate_design: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Design generator task error: {str(e)}",
        )


@app.post("/developer/")
async def developer_task_api(topic: str = Form(...)):
    try:
        try:
            designer_response = await process_topic("/designer/", topic, method="POST")  # Changed to POST
        except HTTPException as e:
            logger.error(f"Error fetching designer response: {str(e)}")
            designer_response = f"Error: {e.detail}"

        developer_agent = agents.developer_agent(my_llm, topic)
        developer_task_backend = tasks.backend_developer_task(developer_agent, topic)

        crew = Crew(
            agents=[developer_agent],
            tasks=[developer_task_backend],
            verbose=True,
        )

        crew_output = crew.kickoff()
        
     
        if hasattr(crew_output, 'result'):
            result = crew_output.result
        elif hasattr(crew_output, 'get_result'):
            result = crew_output.get_result()
        else:
            result = str(crew_output) 

    
        if isinstance(result, str):
            result = result.replace("**", "").replace("*", "")
        else:
            logger.warning(f"Unexpected result type: {type(result)}")

        try:
            with open("outs/backend_developer.md", "w") as file:
                file.write(str(result))
            with open("outs/backend_developer.md", "r") as file:
                backend_content = file.read()
        except FileNotFoundError as e:
            logger.error(f"File not found: {str(e)}")
            backend_content = "File not found"

        response_content = (
            f"\n{backend_content}"
            f"Designer Task Result:\n{designer_response}\n\n"
        )
        return PlainTextResponse(content=response_content)

    except Exception as e:
        logger.error(f"Unexpected error in developer_task_api: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Developer task error: {str(e)}",
        )


@app.get("/tester/", response_class=HTMLResponse)
async def get_tester_task_page():
    return FileResponse("outs/tester.txt")


@app.post("/tester/")
async def tester_task_api(topic: str = Form(...)):
    try:
        try:
            developer_response = await process_topic("/developer/", topic, method="POST")
        except HTTPException as e:
            developer_response = f"Error: {e.detail}"

        tester_agent = agents.tester_agent(my_llm, topic)
        tester_task = tasks.tester_task(tester_agent, topic)

        crew = Crew(
            agents=[tester_agent],
            tasks=[tester_task],
            verbose=True,
        )

        result = crew.kickoff()
        
  
        if hasattr(result, 'result'):
            result_str = result.result
        elif hasattr(result, 'get_result'):
            result_str = result.get_result()
        else:
            result_str = str(result)  
        
        result_str = result_str.replace("**", "").replace("*", "")
        
        with open("outs/tester.md", "w") as f:
            f.write(result_str)

        with open("outs/tester.md", "r") as file:
            tester_content = file.read()

        return PlainTextResponse(
            content=f"\n{tester_content}\nDeveloper Task Result:\n{developer_response}"
        )

    except Exception as e:
        logger.error(f"Unexpected error in tester_task_api: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Tester task error: {str(e)}"
        )



class EditedContent(BaseModel):
    content: str


@app.post("/{agent}/save")
async def save_edited_content(agent: str, edited_content: EditedContent):
    agent_file = f"outs/{agent.lower().replace(' ', '_')}.md"
    with open(agent_file, "w") as f:
        f.write(edited_content.content)
    return {"message": "Content saved successfully"}




@app.post("/create-custom-agent/")
async def create_custom_agent_endpoint(
    name: str = Form(...),
    role: str = Form(...),
    goal: str = Form(...),
    backstory: str = Form(...),
    llm_type: str = Form(...),
    model_name: str = Form(...),
    api_key: Optional[str] = Form(None)
):
    try:
 
        new_agent = agents.create_custom_agent(
            name=name,
            role=role,
            goal=goal,
            backstory=backstory,
            llm_type=llm_type,
            model_name=model_name,
            api_key=api_key
        )
        
      
        agents.save_agent(new_agent)
        
        return {"message": f"Custom agent '{name}' created successfully"}
    except ValueError as ve:
       
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
      
        raise HTTPException(status_code=500, detail=f"Error creating custom agent: {str(e)}")
@app.get("/get-available-models/")
async def get_available_models():
    return agents.get_available_models()

@app.post("/create-custom-task/")
async def create_custom_task(
    agent_name: str = Form(...),
    task_description: str = Form(...),
    expected_output: str = Form(...),
    output_file: str = Form(...),
    tool_name: str = Form(...),          
    api_key: Optional[str] = Form(None),
):
    try:
        custom_agent = agents.get_agent_by_name(agent_name)
        if not custom_agent:
            raise HTTPException(
                status_code=404, detail=f"Agent '{agent_name}' not found"
            )

    
        tools = None

        if tool_name == "SerperTool":
            os.environ["SERPER_API_KEY"] = api_key
            tools = [SerperDevTool()] 
        elif tool_name == "FileReadTool":
            tools = [FileReadTool()]  
        else:
            raise HTTPException(
                status_code=400, detail=f"Unknown tool '{tool_name}'"
            )

      
        if not all(hasattr(tool, '_run') and callable(getattr(tool, '_run')) for tool in tools):
            raise HTTPException(
                status_code=400, detail="One or more tools are missing the required '_run' method implementation"
            )

      
        new_task = tasks.create_custom_task(
            custom_agent, task_description, expected_output, output_file, tools
        )

        return {"message": f"Custom task for '{agent_name}' created successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating custom task: {str(e)}"
        )


@app.post("/execute-custom-task/")
async def execute_custom_task(
    agent_name: str = Form(...), task_description: str = Form(...)
):
    try:
        custom_agent = agents.get_agent_by_name(agent_name)
        if not custom_agent:
            raise HTTPException(
                status_code=404, detail=f"Agent '{agent_name}' not found"
            )

        custom_task = tasks.get_task_by_description(task_description)
        if not custom_task:
            raise HTTPException(
                status_code=404, detail=f"Task '{task_description}' not found"
            )

        crew = Crew(
            agents=[custom_agent],
            tasks=[custom_task],
            verbose=True,
        )

        result = crew.kickoff()
        
      
        if hasattr(result, 'result'):
            result_str = result.result
        elif hasattr(result, 'get_result'):
            result_str = result.get_result()
        else:
            result_str = str(result)  

        return JSONResponse(content={"result": result_str})
    except HTTPException as e:
   
        raise
    except Exception as e:
        logger.error(f"Unexpected error in execute_custom_task: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error executing custom task: {str(e)}"
        )










class ResultUpdate(BaseModel):
    result: str


@app.post("/update-result/")
async def update_result(result: ResultUpdate):
    try:
       
        return JSONResponse(content={"message": "Result updated successfully"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating result: {str(e)}")



# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run(app, host="127.0.0.1", port=8080)

