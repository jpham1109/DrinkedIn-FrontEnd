import React from "react";
import background from "../images/bg3.jpeg"

const Home = () => {
    return(
        <div className="home-page">
            {/* <h1 >Cocktails Tell Stories</h1>  */}
            <img id="background-img" src={background} alt="background"/>
        </div>
    )
}

export default Home;