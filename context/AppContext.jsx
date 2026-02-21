'use client'
import { productsDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY || '$'
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // ✅ ADDED
    const [authLoading, setAuthLoading] = useState(true)


    const fetchProductData = async () => {
        setProducts(productsDummyData)
    }


    const fetchUserData = async () => {

        const storedUser = localStorage.getItem('user');

        if (storedUser) {

            try {

                const user = JSON.parse(storedUser);

                setUserData(user);

                setIsAuthenticated(true);

                setIsAdmin(
                    user.role === 'admin' ||
                    user.role === 'seller' ||
                    false
                );

            }

            catch (error) {

                console.error('Error parsing user data:', error);

                localStorage.removeItem('user');

            }

        }

        // ✅ ADDED
        setAuthLoading(false);

    }



    const login = async (email, password) => {

        try {

            const response = await fetch(
                'http://localhost:5000/api/users/signin',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();

            if (response.ok) {

                setUserData(data.user);

                setIsAuthenticated(true);

                setIsAdmin(
                    data.user.role === 'admin' ||
                    data.user.role === 'seller' ||
                    false
                );

                localStorage.setItem(
                    'user',
                    JSON.stringify(data.user)
                );

                toast.success('Signed in successfully!');

                return { success: true };

            }

            else {

                toast.error(data.error || 'Sign in failed');

                return { success: false };

            }

        }

        catch (error) {

            toast.error('Failed to connect to server');

            return { success: false };

        }

    }



    const logout = () => {

        setUserData(null);

        setIsAuthenticated(false);

        setIsAdmin(false);

        setCartItems({});

        localStorage.removeItem('user');

        toast.success('Logged out successfully');

        router.push('/');

    }



    const addToCart = async (itemId) => {

        if (!isAuthenticated) {

            toast.error('Please sign in to add items to cart');

            router.push('/signin');

            return;

        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {

            cartData[itemId] += 1;

        }

        else {

            cartData[itemId] = 1;

        }

        setCartItems(cartData);

        toast.success('Item added to cart!');

    }



    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);

        if (quantity === 0) {

            delete cartData[itemId];

        }

        else {

            cartData[itemId] = quantity;

        }

        setCartItems(cartData)

    }



    const getCartCount = () => {

        let totalCount = 0;

        for (const items in cartItems) {

            if (cartItems[items] > 0) {

                totalCount += cartItems[items];

            }

        }

        return totalCount;

    }



    const getCartAmount = () => {

        let totalAmount = 0;

        for (const items in cartItems) {

            let itemInfo = products.find(
                (product) => product._id === items
            );

            if (cartItems[items] > 0 && itemInfo) {

                totalAmount +=
                    itemInfo.offerPrice *
                    cartItems[items];

            }

        }

        return Math.floor(totalAmount * 100) / 100;

    }



    const handleBuyNow = (itemId) => {

        if (!isAuthenticated) {

            toast.error('Please sign in to continue');

            router.push('/signin');

            return;

        }

        addToCart(itemId);

        router.push('/cart');

    }



    useEffect(() => {

        fetchProductData()

        fetchUserData()

    }, [])



    useEffect(() => {

        const savedCart = localStorage.getItem('cart');

        if (savedCart) {

            try {

                setCartItems(JSON.parse(savedCart));

            }

            catch (error) {

                console.error('Error loading cart:', error);

            }

        }

    }, [])



    useEffect(() => {

        if (Object.keys(cartItems).length > 0) {

            localStorage.setItem(
                'cart',
                JSON.stringify(cartItems)
            );

        }

    }, [cartItems])



    const value = {

        currency, router,

        isAdmin, setIsAdmin,

        userData, fetchUserData,

        products, fetchProductData,

        cartItems, setCartItems,

        addToCart, updateCartQuantity,

        getCartCount, getCartAmount,

        isAuthenticated,

        authLoading, // ✅ ADDED

        login, logout,

        handleBuyNow

    }



    return (

        <AppContext.Provider value={value}>

            {props.children}

        </AppContext.Provider>

    )

}