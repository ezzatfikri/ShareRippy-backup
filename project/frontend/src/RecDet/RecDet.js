import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RecDet.css';

function RecDet() {
  const { id } = useParams(); // Get the recipe ID from the URL
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    // Fetch the recipe details by ID
    fetch(`http://localhost:5000/recipe/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Recipe Details: ", data); // Debugging line
        setRecipe(data);
      })
      .catch((error) => console.error('Error fetching recipe details:', error));
  }, [id]);

  if (!recipe) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container recipe-detail">
      <h1 className="recipe-title">{recipe.recipeName}</h1>
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl} // Check this line for correctness
          className="img-fluid"
          alt={recipe.recipeName}
        />
      ) : (
        <p>No image available</p>
      )}
      <div className="recipe-description">
        <h3>Description</h3>
        <p>{recipe.description}</p>
      </div>
      <div className="recipe-ingredients">
        <h3>Ingredients</h3>
        <ul>
          {recipe.ingredients.split(',').map((ingredients, index) => (
            <li key={index}>{ingredients}</li>
          ))}
        </ul>
      </div>
      <div className="recipe-steps">
        <h3>Cooking Steps</h3>
        <ol>
          {recipe.cookingSteps.split('.').filter(step => step.trim()).map((step, index) => (
            <li key={index}>{step.trim()}</li>
          ))}
        </ol>
      </div>
      <div className="recipe-difficulty">
        <h3>Difficulty: {recipe.difficulty}</h3>
      </div>
    </div>
  );
}

export default RecDet;
