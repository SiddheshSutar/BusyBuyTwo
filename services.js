import axios from "axios"

export const fetchProducts = async () => {

    return await axios.get(`https://fakestoreapi.com/products`)
    .then(res=>{
        if(!res.data) return []
        return res.data
    })
}