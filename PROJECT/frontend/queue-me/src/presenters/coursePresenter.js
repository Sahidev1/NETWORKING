import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router-dom";
import { getPostOptions, getURL } from "../util/apihelpers";
import CoursePage from "../views/page/coursepage";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

export default function CoursePresenter (){
    const {lastMessage} = useWebSocket('ws://localhost:8080', {share:true});

    const [qitems, setQitems] = useState(null);
    const nav = useNavigate();
    const navHome = () => nav('/');
    const [storage, setStorage] = useState (sessionStorage.getItem('course_queue_id'))
    const user = JSON.parse(localStorage.getItem('user'));

    const locRef = useRef ();
    const comRef = useRef ();
    const refArr = [locRef, comRef];
    const [addItemData, setAddItemData] = useState(null);

    const sortItems = (items) => {
        items.sort((a, b) => a.id < b.id?-1:1);
    }

    const clickAddItem = () => {
        const course_id = sessionStorage.getItem('course_queue_id');
        const user = JSON.parse(localStorage.getItem('user'));
        const newData = {"user_id": user.id, "course_id": course_id,
         "location": locRef.current.value, 'comment': comRef.current.value};
        setAddItemData (newData);
    }

    const clickUpdItem = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const newData = {"user_id": user.id,
         "location": locRef.current.value, 'comment': comRef.current.value};
        setAddItemData (newData);
    }

    useEffect (() => {
        console.log("DEBUGGER" + addItemData);
        const changeHandler = async () => {
            const path = Object.keys(addItemData).length === 4?'additem/':'updateitem/';
            const apiURL = getURL(path);
            const options = getPostOptions(addItemData);
            try {
                await fetch(apiURL,options);
            } catch (error) {
                console.log(error)
            }
        }

        if (addItemData){
            changeHandler();
        }
    }, [addItemData])

    

    const getItems = async () => {
        const course_id = JSON.parse(sessionStorage.getItem('course_queue_id'));
        if (course_id === null) return null;
        const apiURL = getURL('items/');
        const options = getPostOptions({"course_id":course_id});

        try {
            const resp = await fetch (apiURL, options);
            const data = await resp.json();
            if (data.status === "success"){
               // sessionStorage.removeItem('course_queue_id');
                 return data.items;
            }
        } catch (error) {
            console.log(error)
        }
    }

    const dequeue = async (item_id) => {
        const apiURL = getURL('deleteitem');
        const options = getPostOptions({"item_id": item_id});

        try {
            await fetch(apiURL, options);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (lastMessage !== null){
            console.log(lastMessage?.data)
            if (lastMessage.data == 'QUEUE_CHANGE'){
                const itemhandler = async () => {
                    const result = await getItems();
        
                    if (result) {
                        sortItems(result);
                        setQitems (result);
                    }
                }
                if (!storage) navHome();
                else itemhandler();
            }
        }
    },[lastMessage]);

    useEffect(() => {
        const itemhandler = async () => {
            const result = await getItems();

            if (result) {
                console.log(JSON.stringify(result));
                sortItems(result);
                setQitems (result);
            }
        }
        if (!storage) navHome();
        else itemhandler();
    },[])

    return <CoursePage user={user} props={qitems} dequeue={dequeue} refArr={refArr} clickAdd={clickAddItem} clickUpd={clickUpdItem}/>;
}