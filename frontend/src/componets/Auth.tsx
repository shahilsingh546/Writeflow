import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SignupInput } from "@singhisme456/medium-common";
import axios from "axios";
import { BACKEND_URL } from "../config";
export const Auth = ({type}: {type: "signup" | "signin"}) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<SignupInput>({
        email: "",
        name : "",
        password : ""
    })

    async function sendRequest(){
        try{
            console.log("inside request function")
            const url = `${BACKEND_URL}/api/v1/user/${type==="signup" ? "signup": "signin"}`;
            console.log("the url is -> ", url);
            console.log("the post inputs are -> ", postInputs)
            const response = await axios.post(url, postInputs,{
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log("response is -> ", response.data)
            const jwt = response.data.jwt;
            console.log("jwt -> ", jwt)
            localStorage.setItem("token", jwt);
            navigate("/blogs")
        }
        catch(e){
            console.log("error -> ", e)
            alert(`Error while ${type=="signup" ? "Signing up": "Signing in"}`)
        }
    }
    
    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="px-10">
                    <div className="text-3xl font-bold mt-4">
                        Create an account
                    </div>
                    <div className="text-slate-500">
                        {type ==="signin"? "Don't have an account" : "Already have an account?"}
                        <Link className="pl-2 underline" to={type === "signin" ? "/signup": "/signin"}>
                        {type==="signin"? "Sign up": "Sign in"}
                        </Link> 
                    </div>
                </div>
                <div className="pt-8">
                   {type === "signup" ? <LabelledInput  label="Name" type={"none"} placeholder="John Doe" onChange={(e)=>{
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }}/> : null }
                    <LabelledInput  label="Username" type={"none"} placeholder="Johndoe@gmail.com" onChange={(e)=>{
                        setPostInputs({
                            ...postInputs,
                            email : e.target.value
                        })
                    }}/>
                    <LabelledInput  label="Password" type={"password"} placeholder="your password" onChange={(e)=>{
                        setPostInputs({
                            ...postInputs,
                            password: e.target.value
                        })
                    }}/>
                    <button onClick={sendRequest} className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4
                    focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700
                    dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign up" : "Sign in"}</button>
                </div>
            </div>
        </div>
    </div>
}

interface LabelledInputType{
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type: string
}

function LabelledInput({label, placeholder, onChange, type}: LabelledInputType){
    return (
        <div>
            <div>
            <label className="block mb-2.5 text-sm font-semibold text-heading pt-4">{label}</label>
            <input onChange={onChange} type={type || "text"} id="first_name" className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder={placeholder} required />
        </div>
        </div>
    )
}