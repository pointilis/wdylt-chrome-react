import BaseLayout from "../layouts/Base";
import '../index.css';
import '../App.css';
import 'ckeditor5/ckeditor5-content.css';
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfDay, format, formatISO } from 'date-fns';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router";
import Axios from "../utils/Axios";
import TagsCloud from "../components/TagsClound";

const Note = () => {
    let [searchParams] = useSearchParams();
    const today = new Date();
    const [postArgs, setPostArgs] = useState<{
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

    // posts
    const { isLoading, isSuccess, data, refetch } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const { data } = await Axios.get('/wp/v2/posts', {
                params: postArgs,
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
            const { data } = await Axios.get('/wp/v2/posts/stats', {
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

        // set post args
        setPostArgs({
            ...postArgs,
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

        // set post args
        setPostArgs({
            ...postArgs,
            before: formatISO(endOfDay(dateStr)),
            after: formatISO(endOfDay(addDays(dateStr, -1))),
        });
    }

    useEffect(() => {
        const today = new Date();
        const todayBtn = document.querySelector('button.fc-today-button');
        todayBtn?.addEventListener('click', (event: any) => {
            // set post args
            setPostArgs({
                ...postArgs,
                before: formatISO(endOfDay(today)),
                after: formatISO(endOfDay(addDays(today, -1))),
            });
        });

        refetch();
    }, [postArgs, refetch]);

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

            <div className="mb-4">
                <TagsCloud postType={['post']} />
            </div>

            {isLoading ? (
                <div className="block">
                    {'Loading...'}
                </div>
            ) : null}

            {isSuccess ? (
                <div id="notes" className="block">
                    {data.length > 0 ? (
                        <ul className="Notelist">
                            {data.map((post: any, index: number) => (
                                <li key={post.id} className="text-lg py-4 flex">
                                    <div className="w-8 h-8 flex-none mt-1">
                                        <div className="items-center justify-center flex h-full w-full border border-lime-300 bg-lime-100 font-bold">{index + 1}</div>
                                    </div>
                                    <div className="w-full pl-4">
                                        <h3 className="hidden text-xl font-semibold">{post.title.rendered}</h3>

                                        <div className="flex">
                                            <div className="block font-semibold">{format(post.date, 'dd MMMM yyyy HH:mm')}</div>
                                            <div className="ml-auto">
                                                <NavLink className={'text-blue-700 text-sm'} to={{ pathname: '/', search: `?pid=${post.id}&type=${post.type}` }}>{'Edit'}</NavLink>
                                            </div>
                                        </div>
                                        
                                        <div className="block Content ck-content formatted p-4 bg-neutral-200 mt-2" dangerouslySetInnerHTML={{ __html: post.content.rendered }}></div>
                                        {post.tags.length > 0 ? (
                                            <ul className="flex flex-wrap gap-2 mt-3">
                                                {post.tags.map((tag: any) => (
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
                        <div>{'Note for selected date not found.'}</div>
                    )}
                </div>
            ) : null}
        </BaseLayout>
    )
}

export default Note;