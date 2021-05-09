import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CategoryDetail({}) {
    const [categoryDetail, setCategoryDetail] = useState([])
    const [drinks, setDrinks] = useState([])
    const {id} = useParams()

    useEffect(() => {
        fetch(`http://localhost:7000/categories/${id}`)
        .then(r => r.json())
        .then(data=> {
            // setPopularDrinks(category.popular_drinks)
            setCategoryDetail(data)
            setDrinks(data.popular_drinks)
    })}, [id])

    // const { name, definition } = categoryDetail
    // const drinkItems = categoryDetail.popular_drinks.map(d => 
    //     <div>
    //         <img key={d.name} src={d.image} alt={d.name}/>
    //         <p>The {d.name}</p>
    //     </div>
    //     )
    console.log(categoryDetail["popular_drinks"], "category detail")
    const settings = {
        dots: true,
        infinite: false,
        // autoplaySpeed: 4000,
        arrow: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        // initialSlide: 0,
        responsive: [
            {
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: true
            }
            },
            {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                initialSlide: 2
            }
            },
            {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
            }
        ]
      };
    return (
        <div>
            <h2>Category: {categoryDetail.name}</h2>
            <p>{categoryDetail.definition}</p>
            <div className="cocktail-list">
                <Slider {...settings}>
                    {drinks.map(d => 
        <div>
            <img key={d.name} src={d.image} alt={d.name} width="500px" height="400px"/>
            <p>The {d.name}</p>
        </div>
        )}
                </Slider>
            </div>
        </div>
    )
}

export default CategoryDetail
