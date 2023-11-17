import { useState, useEffect } from "react";
import cocktailsCon from "../../images/cocktailsCon.jpeg";
import { useSelector } from "react-redux";
import CocktailForm from "./CocktailForm";
import CocktailCard from "./CocktailCard";
import { useGetCocktailsQuery } from "./cocktailsSlice";
import classnames from "classnames";
import { Spinner } from "../../components/Spinner";
import { selectCurrentUser } from "../user/userSlice";

let SearchCocktail = ({ searchText, onSearch, sort, onSort }) => {
  return (
    <div className="search-sort-wrapper">
      <form className="search">
        <input
          className="search-ingredient"
          type="text"
          placeholder="Search cocktail ingredient..."
          value={searchText}
          onChange={onSearch}
        />
        <button className="search-button" type="submit">
          <i className="fas fa-search-location" />
        </button>
      </form>
      <div className="sort-wrapper">
        {/* <label id="sort-text">Sort by</label> */}
        <select className="sort" id="sort" value={sort} onChange={onSort}>
          <option value="">Sort by</option>
          <option value="name">Cocktail Name</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
    </div>
  );
};

const CocktailsContainer = () => {
  const user = useSelector(selectCurrentUser);

  const [isBartender, setIsBartender] = useState(false);
  const [toggleCocktailForm, setToggleCocktailForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("");

  const handleSearchText = (event) => {
    setSearchText(event.target.value);
  };

  const handleSort = (event) => {
    setSort(event.target.value);
  };

  const handleToggleClick = () => {
    setToggleCocktailForm((prev) => !prev);
  };

  const {
    data: cocktails = [],
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetCocktailsQuery();
  console.log(cocktails, "cocktails");
  const re = new RegExp(searchText);
  const searchedCocktails = cocktails.filter((cocktail) =>
    re.test(cocktail.ingredients.join("\n"))
  );

  const cocktailsToDisplay = [...searchedCocktails].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    } else if (sort === "popularity") {
      return b.likes_count - a.likes_count;
    } else {
      return 0;
    }
  });

  const cocktailCards = cocktailsToDisplay.map((cocktail) => (
    <CocktailCard key={cocktail.id} cocktail={cocktail} />
  ));

  let content;

  if (isLoading) {
    content = <Spinner text="Loading..." />;
  } else if (isSuccess) {
    const containerClassname = classnames("content-container", {
      disabled: isFetching,
    });
    content = (
      <div className={containerClassname}>
        <SearchCocktail
          searchText={searchText}
          onSearch={handleSearchText}
          // checkBox={checkBox}
          // onCheckBox={handleCheckBox}
          sort={sort}
          onSort={handleSort}
        />
        <div className="cocktail">{cocktailCards}</div>
      </div>
    );
  } else if (isError) {
    content = <div>{error}</div>;
  }

  useEffect(() => {
    if (user.bartender) {
      setIsBartender(true);
    }
  }, [user]);

  return (
    <div className="cocktails-container">
      {!isBartender ? null : (
        <div>
          <button className="cocktail-btn" onClick={handleToggleClick}>
            {toggleCocktailForm ? "Hide Cocktail Box" : "Add Your Cocktail"}
          </button>
        </div>
      )}
      {!toggleCocktailForm ? null : <CocktailForm />}
      <h1>FEATURED COCKTAILS</h1>
      {content}
      <img id="cocktails-img" src={cocktailsCon} alt="landscape" />
    </div>
  );
};

export default CocktailsContainer;
