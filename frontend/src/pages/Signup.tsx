import "../App.css";
import { Quote } from "../componets/Quote";
import { Auth } from "../componets/Auth";
export const Signup = () => {
    return <div className="grid grid-cols-1 lg:grid-cols-2">
        <div>
            <Auth type={"signup"}/>
        </div> 
        <div className="hidden lg:block"> 
            <Quote/>
        </div>
    </div>
}