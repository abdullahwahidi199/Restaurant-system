import Header from "./Header";
import MenuPage from "./MenuPage";

// these restaurant info comes from app.jsx file there it is fetched and sent to wherever needed as props
export default function CustomerHomepage({restaurantInfo}){
    
    return(
        <div>
            <Header restaurantInfo={restaurantInfo}/>
            <MenuPage/>
        </div>
    )
}