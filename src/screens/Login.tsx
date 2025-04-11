/// <reference types="chrome"/>

import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import * as Yup from 'yup';
import Axios from "../utils/Axios";
import { useEffect, useState } from "react";
import { NavLink, redirect, useNavigate } from "react-router";
import logo from '../logo.png';

const Login = () => {
    const navigate = useNavigate();
    const runInChromeExt = window.chrome && chrome.runtime && chrome.runtime.id;
    const title: string = 'What Did You Learn Today?';
    const [error, setError] = useState<any>();
    const validationSchema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6),
    });

    // login mutation
    const loginMutation = useMutation({
        mutationFn: async (variables: any) => {
            const { data } = await Axios.post('/jwt-auth/v1/token', variables, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return data;
        },
        onMutate: () => {
            setError(null);
        },
        onError: (error: any) => {
          setError(error.response.data);
        },
        onSuccess: (data: any) => {
            if (runInChromeExt) {
                chrome.storage.local.set({ user: data }).then(() => {
                    console.log("User value is set");
                });
            } else {
                window.localStorage.setItem('user', JSON.stringify(data));
            }

            navigate("/", { replace: true });
        }
    });

    const handleSubmit = async (values: any) => {
        loginMutation.mutate({
            username: values.email,
            password: values.password,
        });
    }

    useEffect(() => {
        if (runInChromeExt) {
            chrome.storage.local.get(["user"]).then((result) => {
                if (result.user) {
                    navigate("/");
                }
            });
        }
    }, [])

    return (
        <main className='Main p-4 text-lg'>
            <div className="flex">
                <div className='pr-3'>
                    <img src={logo} alt={title} className='w-14 h-14' />
                </div>

                <div className="block">
                    <div className='text-xl mb-0 font-bold'>{title}</div>
                    <div className="block mb-5">{'Login to your account.'}</div>
                </div>
                <div className='ml-auto'>
                    <NavLink to={'/register'} end>
                        <button type='button' className='rounded-full px-3 py-1 text-md text-blue-700 border border-blue-700'>{'Register'}</button>
                    </NavLink>
                </div>
            </div>
            

            {loginMutation.isError && error ? (
                <div className="mb-2 text-red-600" dangerouslySetInnerHTML={{ __html: error.message }}>{}</div>
            ) : null}

            <Formik
                validationSchema={validationSchema}
                initialValues={{
                    email: '',
                    password: '',
                }}
                onSubmit={handleSubmit}
            >
                {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        setFieldValue,
                        setFieldTouched,
                        setFieldError,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block mb-1">{'Email Address'}</label>

                                <input 
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="px-4 py-1.5 border border-neutral-400 rounded-lg block w-full"
                                    placeholder={'Email Address'}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                ></input>

                                {errors.email && touched.email ? (
                                    <div className="block text-base text-red-600 mt-1">{errors.email}</div>
                                ) : null}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block mb-1">{'Password'}</label>
                                <input 
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="px-4 py-1.5 border border-neutral-400 rounded-lg block w-full"
                                    placeholder={'Password'}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                ></input>

                                {errors.password && touched.password ? (
                                    <div className="block text-base text-red-600 mt-1">{errors.password}</div>
                                ) : null}
                            </div>

                            <button 
                                type="submit"
                                className="ml-auto px-6 py-2 rounded-full uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isSubmitting}
                            >
                                {'Submit'}
                            </button>
                        </form>
                    )
                }
            </Formik>
        </main>
    )
}

export default Login;