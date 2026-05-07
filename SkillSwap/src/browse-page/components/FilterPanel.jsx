export default function FilterPanel({category, proficiency, onCategoryChange, onProficiencyChange }){
const CATEGORIES = [
  '',
  'Technology & Programming',
  'Design & Creative',
  'Music & Arts',
  'Language & Writing',
  'Cooking & Food',
  'Fitness & Sports',
  'Academic Tutoring',
  'Trades & DIY',
  'Business & Finance',
  'Photography & Video',
  'Other'
]

const PROFICIENCIES = [
  '',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
]

    
    return(
        <div className="filter-panel">
            <select value={category} onChange={onCategoryChange}
             className="filter-select">

                {/*  so this line loops through each category in the CATEGORIES 
                    Array. */}
                {CATEGORIES.map((cat, i) =>(
                    /* in here we create a option for each different category,
                       i is our index numbers, and the value cat is what the user sends
                       in. */
                    <option key={i} value={cat}>{cat || 'All categories'}</option>
                ))}

            </select>

            <select value = {proficiency} onChange={onProficiencyChange} className="filter-select">
                {PROFICIENCIES.map((level,i) => (
                    <option key={i} value={level}>{level || 'All levels'}</option>
                ))}
            </select>
        </div>
    )
}
