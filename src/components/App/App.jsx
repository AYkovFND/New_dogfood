import Header from '../Header/Header';
import { useEffect, useState } from 'react';
import Logo from '../Logo/Logo';
import Search from '../Search/Search';
import Footer from '../Footer/Footer';
import api from "../../utils/api";
import SearchInfo from '../SearchInfo/SearchInfo';
import useDebounce from '../../hooks/useDebounce';
import { Route, Routes, useLocation } from 'react-router-dom';
import CatalogPage from '../../pages/CatalogPage/CatalogPage';
import ProductPage from '../../pages/ProductPage/ProductPage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import FavouritesPage from '../../pages/FavouritesPage/FavouritesPage';
import RegistrationForm from '../Forms/RegistrationForm/RegistrationForm.jsx';
import Modal from '../Modal/Modal';
import LoginForm from '../Forms/LoginForm/LoginForm';
import ResetPasswordForm from '../Forms/ResetPasswordForm/ResetPasswordForm';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProductsThunk } from '../../redux/redux-thunk/products-thunk/getAllProductsThunk';
import FAQPage from '../../pages/FAQPage/FAQPage';
import MainPage from '../../pages/MainPage/MainPage';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import { checkTokenThunk } from '../../redux/redux-thunk/user-thunk/checkTokenThunk';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import { getSearchQueryThunk } from '../../redux/redux-thunk/products-thunk/getSearchQueryThunk';

function Application() {
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { products} = useSelector(state => state.products);
    const debounceSearchQuery = useDebounce(searchQuery, 300);
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;
    const initialPath = location.state?.initialPath;

    const dispatch = useDispatch();

    const token = localStorage.getItem('jwt');
    console.log('token---->', token);

    useEffect(() => {
       const userData =  dispatch(checkTokenThunk(token));
        if (token) {
            userData.then(()=> {
                dispatch(getAllProductsThunk(token));
            }) 
        }
      
    }, [dispatch, token]);

    useEffect(() => {
        if (token) {
            handleRequest();
            console.log('INPUT', debounceSearchQuery)
        }
    }, [debounceSearchQuery]);

    const handleRequest = async () => {
        await dispatch(getSearchQueryThunk({searchQuary: debounceSearchQuery, token}));   
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        handleRequest();
    }

    // console.log(searchQuery);

    const handleInputChange = (inputValue) => {
        setSearchQuery(inputValue)
    }

    const handleUpdateUser = (userUpdate) => {
        api.setUserInfo(userUpdate).then((newUserData) => {
            setCurrentUser(newUserData);
        })
    }

    return (
       <>
            <Header user={currentUser} updateUserHandle={handleUpdateUser}>
                <Logo className='logo logo_place_header' href='/'/>

                <Routes>
                    <Route path="/catalog" element={
                         <Search onInput={handleInputChange} onSubmit={handleFormSubmit}/>
                    }/>
                </Routes>
            </Header>
            <main className='content'>
                <SearchInfo searchCount={products.length} searchText={searchQuery}/>
                <Routes location={(backgroundLocation && {...backgroundLocation, pathname: initialPath} ) || location}>
                    <Route index element={<MainPage />}/>
                    <Route path='/catalog' element={
                            <CatalogPage />
                    }/>
                    <Route path="/product/:productId" element={
                            <ProductPage />
                    }/>
                    <Route path="/favourites" element={<FavouritesPage/>}/>
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <ProfilePage/>
                        </ProtectedRoute>
                    }/>
                    <Route path="/login" element={
                        <ProtectedRoute isOnlyAuth>
                            <LoginForm/>
                        </ProtectedRoute>
                    } />
                    <Route path="/faq" element={<FAQPage/>} />
                    <Route path="/registration" element={
                        <ProtectedRoute isOnlyAuth>
                            <RegistrationForm/>
                        </ProtectedRoute>
                    }/>
                    <Route path="/reset-password" element={
                        <ProtectedRoute isOnlyAuth>
                            <ResetPasswordForm/>
                        </ProtectedRoute>
                    }/>
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
                {backgroundLocation && (
                    <Routes>
                        <Route path='/login' element={
                            <ProtectedRoute isOnlyAuth>
                                <Modal>
                                    <LoginForm linkState={{backgroundLocation: location, initialPath}} />
                                </Modal>
                            </ProtectedRoute>
                        }/>
                         <Route path='/registration' element={
                            <ProtectedRoute isOnlyAuth>
                                <Modal>
                                    <RegistrationForm linkState={{backgroundLocation: location, initialPath}} />
                                </Modal>
                            </ProtectedRoute>
                        }/>
                        <Route path='/reset-password' element={
                            <ProtectedRoute isOnlyAuth>
                                <Modal>
                                    <ResetPasswordForm linkState={{backgroundLocation: location, initialPath}} />
                                </Modal>
                            </ProtectedRoute>
                        }/>
                    </Routes>
                )}

            </main>   
            <Footer/> 
        </>
    )
}

export default Application;