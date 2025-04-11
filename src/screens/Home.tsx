/// <reference types="chrome"/>

import BaseLayout from "../layouts/Base";
import '../index.css';
import RichEditor from "../components/RichEditor";
import { useEffect, useRef, useState } from "react";
import {  useBlocker, useNavigate, useSearchParams } from "react-router";
import { Formik } from "formik";
import * as Yup from 'yup';
import Axios from "../utils/Axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { title } from "process";

const Home = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [pid, setPid] = useState<number | string>();
    const runInChromeExt = window.chrome && chrome.runtime && chrome.runtime.id;
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => {
            // if (currentLocation.pathname !== nextLocation.pathname && formValues.content !== '') {
            //     return true;
            // }

            return false;
        }
    )
    
    const [errMsg, setErrMsg] = useState<string>("");
    const [formValues, setFormValues] = useState<{ 
        content: string, 
        tags?: string 
    }>({
        content: "",
        tags: "",
    });
    const editoRef = useRef<any>(() => {});

    const blockerProceedHandler = (blocker: any) => {
        blocker.proceed();

        if (runInChromeExt) {
            // clear chrome storage 
            chrome.storage.local.remove(["post"], () => {
                var error = chrome.runtime.lastError;
                if (error) {
                    console.error(error);
                }

                setFormValues({
                    content: '',
                    tags: '',
                });
            });
        }
    }
    
    // Save post
    const saveHandler = async (values: any = {}) => {
        // reset the error
        setErrMsg("");

        // convert comma separated tags to array
        let tags = values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : null;
        values = {
            ...values,
            tags: tags,
        }

        let doc = new DOMParser().parseFromString(values.content, 'text/html');
        let title =  doc.body.textContent || "";
        const payload = {
            ...values,
            status: 'publish',
            title: title.substring(0, 200),
        }

        try {
            const { data } = await Axios.post('/wp/v2/posts', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return data;
        } catch (err: any) {
            const { response } = err;
            const msg = response.data.message;
            setErrMsg(msg);
        }
    }

    // retrieve single post
    const retrivePostMutation = useMutation({
        mutationFn: async (variables: any) => {
            const { data } = await Axios.get('/wp/v2/posts/' + variables.pid);
            return data;
        },
        onSuccess: (data) => {
            editoRef.current.setData(data.content.rendered);
            setFormValues({
                content: data.content.rendered,
                tags: data.tags.map((obj: any) => obj.name).join(', '),
            });
        }
    });

    // update post
    const updatePostMutation = useMutation({
        mutationFn: async (variables: any) => {
            const { data } = await Axios.post('/wp/v2/posts/' + pid, variables);
            return data;
        },
    });

    // cancel update
    const cancelHandler = () => {
        navigate('/', { replace: true });

        if (runInChromeExt) {
            chrome.storage.local.remove(["post"]);
        } else {
            window.localStorage.removeItem('post');
        }

        editoRef.current.reset();
        setFormValues({
            content: "",
            tags: "",
        });
    }

    const PostSchema = Yup.object().shape({
        content: Yup.string()
            .required('Required'),
        tags: Yup.string(),
    });

    useEffect(() => {
        const hasValues = Object.values(formValues).join(',').replace(/,/g, '') !== '';
        if (hasValues) {
            if (runInChromeExt) {
                chrome.storage.local.set({ post: formValues }).then(() => {
                    console.log("Post value is set");
                });
            } else {
                window.localStorage.setItem('post', JSON.stringify(formValues));
            }
        }
    }, [formValues]);

    useEffect(() => {
        if (runInChromeExt) {
            chrome.storage.local.get(["post"]).then((result) => {
                if (result.post) {
                    editoRef.current.setData(result.post.content);
                    setFormValues(result.post);
                }
            });
        } else {
            let post: any = localStorage.getItem('post');
            post = post ? JSON.parse(post) : null;

            if (post) {
                setTimeout(() => {
                    editoRef.current.setData(post.content);
                    setFormValues(post as any);
                }, 50);
            }
        }
    }, [setFormValues]);

    useEffect(() => {
        if (runInChromeExt) {
            chrome.storage.local.get(["user"]).then((result) => {
                if (!result.user) {
                    navigate("/register", { replace: true });
                }
            });
        }
    }, []);

    useEffect(() => {
        const pid = searchParams.get('pid');
        if (pid) {
            setPid(pid);
            retrivePostMutation.mutate({ pid: pid });
        } else {
            setPid('');
        }
    }, [searchParams]);

    return (
        <BaseLayout>
            <div className="pt-3">
                {errMsg !== "" ? (
                    <div className="p-4 bg-rose-100 rounded-xl mb-4">{errMsg}</div>
                ): null}

                {blocker.state === "blocked" ? (
                    <div className="p-4 bg-rose-100 rounded-xl mb-4">
                        <p>{'Are you sure you want to leave? Content in the editor will deleted!'}</p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button onClick={() => blockerProceedHandler(blocker)} className="px-3 py-1 rounded-full bg-rose-600 text-white">
                                {'Proceed'}
                            </button>
                            <button onClick={() => blocker.reset()}>
                                {'Close'}
                            </button>
                        </div>
                    </div>
                ) : null}
                
                <Formik
                    initialValues={formValues}
                    validationSchema={PostSchema}
                    enableReinitialize={true}
                    onSubmit={async (values, { setSubmitting, resetForm, setFieldTouched, setFieldValue, setFieldError, setErrors }) => {
                        let data: any;

                        if (pid && pid != '') {
                            // update
                            await updatePostMutation.mutateAsync(values);
                            data = {
                                ...data,
                                id: pid,
                            }
                        } else {
                            // create
                            data = await saveHandler(values);
                        }

                        setSubmitting(false);
                        setFieldTouched('content', false);

                        if (data && data.id) {
                            editoRef.current.reset();
                            resetForm();
                            
                            setFormValues({
                                content: '',
                                tags: '',
                            });

                            if (runInChromeExt) {
                                chrome.storage.local.remove(["post"]);
                            } else {
                                window.localStorage.removeItem('post');
                            }

                            navigate('/notes?from=submit');
                        }
                    }}
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
                            <div className="flex items-center mb-2">
                                <div className="text-xl font-bold">{'Save what you learned'}</div>

                                {pid ? (
                                    <div className="ml-auto">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                type="button"
                                                className="ml-auto px-3 text-base py-0.5 rounded-full uppercase tracking-widest border border-red-600 text-red-700"
                                                disabled={isSubmitting}
                                                onClick={cancelHandler}
                                            >
                                                {'Cancel'}
                                            </button>

                                            <button 
                                                type="submit"
                                                className="ml-auto px-3 text-base py-0.5 rounded-full uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white"
                                                disabled={isSubmitting}
                                            >
                                                {'Update'}
                                            </button>
                                        </div>
                                    </div>
                                ) : 
                                    <button 
                                        type="submit"
                                        className="ml-auto px-6 py-2 rounded-full uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isSubmitting}
                                    >
                                        {'Submit'}
                                    </button>
                                }
                            </div>
                            
                            <div className="mb-3">
                                <RichEditor 
                                    content={''}
                                    ref={editoRef}
                                    onBlur={() => {}}
                                    onChange={(value: string) => {
                                        setFieldTouched('content', true);
                                        setFormValues({
                                            ...formValues,
                                            content: value,
                                        });
                                        setFieldValue('content', value);

                                        if (value === '') {
                                            // reset
                                            if (blocker.state === "blocked") {
                                                blocker.reset();
                                            }
                                        }
                                    }}
                                />
                                
                                {errors.content && touched.content ? (
                                    <div className="block text-base text-red-600 mt-1">{errors.content}</div>
                                ) : null}
                            </div>

                            <div className="mb-3">
                                <input 
                                    type="text"
                                    name="tags"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-lg"
                                    onChange={(event) => {
                                        setFormValues({
                                            ...formValues,
                                            tags: event.target.value,
                                        });

                                        handleChange(event);
                                    }}
                                    onBlur={handleBlur}
                                    value={values.tags}
                                    placeholder={'Tags separate with comma (,)'}
                                ></input>
                                {errors.tags && touched.tags ? errors.tags : null}
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </BaseLayout>
    )
}

export default Home;