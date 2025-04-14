import BaseLayout from "../layouts/Base";
import '../index.css';
import '../App.css';
import 'ckeditor5/ckeditor5-content.css';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfDay, format, formatISO } from 'date-fns';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router";
import Axios from "../utils/Axios";

const Todo = () => {
    const queryClient = useQueryClient();
    let [searchParams] = useSearchParams();
    const today = new Date();
    const [todoArgs, setTodoArgs] = useState<{
        page: number
        per_page: number
        before: string
        after: string
    }>({
        page: 1,
        per_page: 100,
        before: formatISO(endOfDay(today)),
        after: formatISO(endOfDay(addDays(today, -1))),
    });
    const [statsArgs, setStatsArgs] = useState<{
        month: number | string
        year: number | string
    }>({
        month: format(today, 'MM'),
        year: format(today, 'yyyy'),
    });
    const [events, setEvents] = useState<any[]>([]);

    // todos
    const { isLoading, isSuccess, data: todosData, refetch } = useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            const { data } = await Axios.get('/wp/v2/todos', {
                params: todoArgs,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return data;
        }
    });

    // stats
    const { refetch: statsRefect } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const { data } = await Axios.get('/wp/v2/todos/stats', {
                params: statsArgs,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            setEvents(data.map((obj: any) => {
                return {
                    title: obj.post_count,
                    date: obj.date,
                }
            }));

            return data;
        }
    });

    const handleDateClick = (arg: any) => {
        const dateStr = arg.dateStr;
        const daysEl = document.querySelectorAll('td.fc-day');
        daysEl.forEach((el) => {
            el.classList.remove('fc-day-highlighted');
        });

        const daySelectedEl = document.querySelector(`td[data-date="${dateStr}"]`);
        daySelectedEl?.classList.add('fc-day-highlighted');

        // set todo args
        setTodoArgs({
            ...todoArgs,
            before: formatISO(endOfDay(dateStr)),
            after: formatISO(endOfDay(addDays(dateStr, -1))),
        });
    }

    const handleDateSet = (arg: any) => {
        const currentDate = arg.view.getCurrentData().currentDate;
        const monthNum = format(currentDate, 'MM');
        const yearNum = format(currentDate, 'yyyy');

        setStatsArgs({
            ...statsArgs,
            month: monthNum,
            year: yearNum,
        })
    }

    const handleEventClick = (arg: any) => {
        const dateStr = arg.el.closest('td').getAttribute('data-date');
        const daysEl = document.querySelectorAll('td.fc-day');
        daysEl.forEach((el) => {
            el.classList.remove('fc-day-highlighted');
        });

        const daySelectedEl = document.querySelector(`td[data-date="${dateStr}"]`);
        daySelectedEl?.classList.add('fc-day-highlighted');

        // set todo args
        setTodoArgs({
            ...todoArgs,
            before: formatISO(endOfDay(dateStr)),
            after: formatISO(endOfDay(addDays(dateStr, -1))),
        });
    }

    const markDoneMutation = useMutation({
        mutationFn: async (variables: any) => {
            const { data } = await Axios.put(`/wp/v2/todos/${variables.id}`, {
                meta: {
                    state: variables.state,
                }
            });

            return data;
        },
        onSuccess: (data: any) => {
            queryClient.setQueryData(['todos'], (prev: any) => {
                const index = prev.findIndex((obj: any) => obj.id === data.id);
                return [
                    ...prev.slice(0, index),
                    {
                        ...prev[index],
                        meta: {
                            ...prev[index].meta,
                            state: data.meta.state,
                        }
                    },
                    ...prev.slice(index + 1),
                ];
            });
        }
    });

    const markTodoHandler = async (todo: any, state: string) => {
        await markDoneMutation.mutateAsync({ id: todo.id, state: state });
    }

    useEffect(() => {
        const today = new Date();
        const todayBtn = document.querySelector('button.fc-today-button');
        todayBtn?.addEventListener('click', (event: any) => {
            // set todo args
            setTodoArgs({
                ...todoArgs,
                before: formatISO(endOfDay(today)),
                after: formatISO(endOfDay(addDays(today, -1))),
            });
        });

        refetch();
    }, [todoArgs, refetch]);

    useEffect(() => {
        statsRefect();
    }, [statsArgs, statsRefect]);

    useEffect(() => {
        const from = searchParams.get('from');
        if (from === 'submit' && isSuccess) {
            window.scrollTo(0, 300);
        }
    }, [searchParams, isSuccess]);

    return (
        <BaseLayout>
            <div className="mb-4 pt-3">
                <FullCalendar
                    plugins={[ dayGridPlugin, interactionPlugin ]}
                    initialView="dayGridMonth"
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    datesSet={handleDateSet}
                    events={events}
                />
            </div>

            {isLoading ? (
                <div className="block">
                    {'Loading...'}
                </div>
            ) : null}

            {isSuccess ? (
                <div id="notes" className="block">
                    {todosData.length > 0 ? (
                        <ul className="Todolist">
                            {todosData.map((todo: any, index: number) => (
                                <li key={todo.id} className={`text-lg py-4 px-4 border-b border-neutral-300 flex ${todo.meta.state === 'done' ? 'bg-lime-100' : ''}`}>
                                    <div className="w-8 h-8 flex-none mt-1">
                                        <div 
                                            className={`items-center justify-center flex h-full w-full borde ${todo.meta.state === 'done' ? 'bg-lime-600' : 'bg-orange-600'} text-white font-bold`}
                                        >
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="w-full pl-4">
                                        <h3 className="hidden text-xl font-semibold">{todo.title.rendered}</h3>

                                        <div className="flex">
                                            <div className="flex items-center">
                                                <div className="block font-semibold mr-3">
                                                    {format(todo.date, 'dd MMMM yyyy HH:mm')}
                                                </div>

                                                {todo.meta.state !== 'done' ? (
                                                    <button 
                                                        type="button"
                                                        className="bg-lime-700 rounded-full flex items-center text-xs h-6 px-2 leading-normal uppercase text-white"
                                                        onClick={() => markTodoHandler(todo, 'done')}
                                                    >
                                                        {'Mark Done'}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        className="bg-orange-700 rounded-full flex items-center text-xs h-6 px-2 leading-normal uppercase text-white"
                                                        onClick={() => markTodoHandler(todo, 'willdo')}
                                                    >
                                                        {'Mark Will do'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="ml-auto">
                                                <NavLink className={'text-blue-700 text-sm'} to={{ pathname: '/', search: `?pid=${todo.id}&type=${todo.type}` }}>{'Edit'}</NavLink>
                                            </div>
                                        </div>
                                        
                                        <div className="block Content ck-content formatted" dangerouslySetInnerHTML={{ __html: todo.content.rendered }}></div>
                                        {todo.tags.length > 0 ? (
                                            <ul className="flex flex-wrap gap-2 mt-3">
                                                {todo.tags.map((tag: any) => (
                                                    <li key={tag.term_id}>
                                                        <NavLink to={{ pathname: '/tags/' + tag.term_id, search: '?term=' + tag.name }} end>
                                                            <span className="px-2 py-0.5 rounded-full border border-neutral-400 cursor-pointer">{tag.name}</span>
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>{'Todo for selected date not found.'}</div>
                    )}
                </div>
            ) : null}
        </BaseLayout>
    )
}

export default Todo;