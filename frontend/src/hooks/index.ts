import axios from "axios"
import {useEffect, useState } from "react"
import { BACKEND_URL } from "../config"

export interface Blog{
    "content":string,
    "title":string,
    "id":string,
    "author":{
        "name":string | null
    }
}

export const useBlog = ({id} : {id:string | undefined}) =>{
    const[loading,setLoading]= useState(true)
    const[blog,setBlog]= useState<Blog | null>(null);

    useEffect(()=>{
        if (!id) {
            setLoading(false);
            return;
        }

        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers : {
                Authorization : `Bearer ${localStorage.getItem("token")}`
            }
        }).
        then(res =>{
            setBlog(res.data.blog);
            setLoading(false)
        })
    },[id])
    return {
        loading,
        blog
    }
}

export const useBlogs = () =>{
    const[loading, setLoading] = useState(true)
    const[blogs,setBlogs] = useState<Blog[]>([])

    useEffect(()=>{
        console.log("before sending reqs")
        console.log(`Bearer ${localStorage.getItem("token")}`)
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization : `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(res =>{
            setBlogs(res.data.posts);
            setLoading(false)
        })
    },[]);
    return {
        loading,
        blogs
    }

}
