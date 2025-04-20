import { FormEvent } from "react";
import { ReactFormState } from "react-dom/client";
import { useState } from "react";
import { InferenceClient } from "@huggingface/inference";
import Markdown from 'markdown-to-jsx'

function Main() {

    const [ingredients, setIngredients] = useState<string[]>([]);
    const [ingredientsAdded, setIngredientsAdded] = useState(false);
    const [generatedRecipe, setGeneratedRecipe]= useState<string>("");
    const [isRecipeBeingAdded, setIsRecipeBeingAdded]=useState(true);

    const SYSTEM_PROMPT = "You are an assistant that receives a list of ingredients that a user has and suggests a recipe of Indian cuisine they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render a web page"

    const ingredientsList = ingredients.map((ingredient)=>(
        <li key={ingredient}>{ingredient}</li>
    ));

    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        console.log("Form submitted");
        const formData = new FormData(event.currentTarget);
        const ingredient = formData.get("ingredient") as string;
        console.log(ingredients);
        setIngredients(prev => [...prev,ingredient]);
        event.currentTarget.reset();
    }

    function resetPage(){
        setGeneratedRecipe("")
        setIsRecipeBeingAdded(true);
        setIngredients([])
    }

    async function fetchRecipe(){
        const client = new InferenceClient(process.env.HF_API_KEY);

        const chatCompletion = await client.chatCompletion({
            provider: "together",
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: `I have ${ingredients.join(", ")}`,
                },
            ],
            max_tokens: 512,
        });
        console.log(chatCompletion.choices[0].message.content);
        setGeneratedRecipe(chatCompletion.choices[0].message.content as string);
        setIsRecipeBeingAdded(false)

    }

    return (
        <main>{ isRecipeBeingAdded && <div>
            <form className="add-ingredient-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="e.g coriander" aria-label="Add ingredient" name="ingredient">
                </input>
                <button>Add ingredient</button>
            </form>
            {ingredients.length ==0 && <h3>Add ingredients to begin</h3>}
            {ingredients.length !=0 && <h3>Ingredients Added: </h3>}
            <ul>
                {ingredientsList}
            </ul>
            {ingredients.length > 3 && <div className="get-recipe-container">
                <div>
                    <h3>Ready for a recipe?</h3>
                    <p>Generate a recipe from your list of ingredients.</p>
                </div>
                <button onClick={fetchRecipe}>Get a recipe</button>
            </div>}
            </div>
            }{ !isRecipeBeingAdded &&
            <div>
            <section>
                <Markdown>
                    {generatedRecipe}
                </Markdown>
            </section>
            <button className="refresh-button" onClick={resetPage}>Need another recipe?</button>
            </div>
            }
        </main>
    )
}

export default Main;