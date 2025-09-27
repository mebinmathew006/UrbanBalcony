import axiosInstance from "../src/axiosconfig";

export const deleteWishlistRoute = async (productId)=>
{
    const resposne = await axiosInstance.delete(`/wishlist/${productId}`);
    return resposne
}
export const addWishlistRoute = async (productId)=>
{
    const resposne = await axiosInstance.post(`/wishlist/${productId}`);
    return resposne
}