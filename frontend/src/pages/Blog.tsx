import { Appbar } from "../componets/Appbar";
import { Spinner } from "../componets/Spinner";
import { FullBlog } from "../componets/FullBlog";
import { useBlog } from "../hooks"
import { useParams } from "react-router-dom";

export const Blog = ()=>{
    const { id } = useParams();
    const { loading,blog } = useBlog({id});
    if (loading || !blog) {
        return <div>
            <Appbar />
            <div className="h-screen flex flex-col justify-center">
                <div className="flex justify-center">
                    {loading ? <Spinner /> : <div className="text-sm text-stone-500">Post not found</div>}
                </div>
            </div>
        </div>
    }
    return <div>
        <FullBlog blog={blog}/>
    </div>
}
