import RecipeInfo from "../components/RecipeInfo";

import recipe from '../data/recipe.json';

export default function RecipePage() {

    return (
        <div className="-mx-4 bg-stone-100 px-3 py-6 sm:mx-0 sm:rounded-3xl sm:px-6 sm:py-12 md:py-20">
            <article className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl bg-white p-5 sm:space-y-8 sm:rounded-3xl sm:p-8 md:p-10">
                <RecipeInfo 
                    title={recipe.title}
                    summary={recipe.summary}
                    cover={recipe.cover}
                    prepMinutes={recipe.prepMinutes}
                    cookMinutes={recipe.cookMinutes}
                />
                <hr className="border-stone-200"/>
                {/* os outros componentes Ingredients e Instructions  */}
            </article>
        </div>
    );
}