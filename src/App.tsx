import { useState, useEffect } from 'react';
import './App.css';
import { usePromiseTracker } from 'react-promise-tracker';
import { trackPromise } from 'react-promise-tracker';
import { ThreeDots } from 'react-loader-spinner';

function App() {
    const [list, setList] = useState<Picture[]>([]);
    const [liked, setLiked] = useState<string[]>([]);
    const [daysAgo, setDaysAgo] = useState<number>(10);

    const LoadingIndicator = () => {
        const { promiseInProgress } = usePromiseTracker();
        return (
            <div className="spinner-container">
                {promiseInProgress && <ThreeDots color="var(--base09)" height="200" width="200" />}
            </div>
        );
    }

    useEffect(() => {
        const likedLocalStorage = localStorage.getItem("liked");
        const likedParsed = likedLocalStorage ? JSON.parse(likedLocalStorage) : [];
        setLiked(likedParsed);
        queryRange(getDaysAgo(10), getCurrentDate());
    }, []);

    return (
        <div className="App">
            <header>
                <span className="logo">Spacestagram</span>
            </header>
            <div className="content">
                <div className="cards">
                    {list.map((item) => {
                        const isLiked = liked.includes(item.date);
                        return (
                            <div className="card">
                                <img src={item.url} alt={item.title} />
                                <div className="card-container">
                                    <h3>{item.title}</h3>
                                    <p className="copyright">
                                        {item.date + " - " + item.copyright}
                                    </p>
                                    <p>{item.explanation}</p>
                                    <div className="buttons">
                                        <button>Share</button>

                                        <button
                                            className={ isLiked ? "liked" : "" }
                                            onClick={() => {
                                                if (isLiked) {
                                                    unlike(item)
                                                } else {
                                                    like(item)
                                                }
                                            }}
                                        >
                                            { isLiked ? "Unlike"  : "Like"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={() => {

                    queryRange(getDaysAgo(daysAgo + 10), getCurrentDate());
                    // loadMore(getDaysAgo(daysAgo + 10), getDaysAgo(daysAgo + 1))
                    setDaysAgo((prevState) => prevState + 10)
                }}>Load More</button>
                <LoadingIndicator />
            </div>
        </div>
    );

    function getCurrentDate() {
        let d = new Date();
        let date = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        return `${year}-${month<10?`0${month}`:`${month}`}-${date}`
    }

    function getDaysAgo(days: number) {
        let d = new Date();
        d.setDate(d.getDate() - days);
        let date = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        return `${year}-${month<10?`0${month}`:`${month}`}-${date}`
    }

    function like(picture: Picture) {
        setLiked((prevState) => {
            let newState = [ ...prevState, picture.date ];
            localStorage.setItem("liked", JSON.stringify(newState));
            console.log(newState)
            return newState;
        });
    }

    function unlike(picture: Picture) {
        setLiked((prevState) =>  {
            let newState = [ ...(prevState.filter(item => item !== picture.date)) ]
            localStorage.setItem("liked", JSON.stringify(newState));
            console.log(newState)
            return newState;
        });
    }

    // function queryDate() {
    //     fetch(
    //         "https://api.nasa.gov/planetary/apod?api_key=XSPgDz48OzDrdgfz5ACZThYxHvY7IwyUWFYbClbH",
    //         {
    //             "method": "GET",
    //         })
    //         .then(response => response.json())
    //         .then(response => {
    //             setList([{
    //                 copyright: response['copyright'],
    //                 date: response['date'],
    //                 explanation: response['explanation'],
    //                 hdurl: response['hdurl'],
    //                 mediaType: response['mediaType'],
    //                 serviceVersion: response['serviceVersion'],
    //                 title: response['title'],
    //                 url: response['url'],
    //             }]);
    //         });
    // }

    function queryRange(startDate: string, endDate: string) {
        trackPromise(
            fetch( "https://api.nasa.gov/planetary/apod?api_key=XSPgDz48OzDrdgfz5ACZThYxHvY7IwyUWFYbClbH&start_date=" + startDate + "&end_date=" + endDate,
                {
                    "method": "GET",
                })
            .then(response => response.json())
            .then(response => {
                setList(response.reverse());
            }));
    }
}

interface Picture  {
    copyright: string;
    date: string;
    explanation: string;
    hdurl: string;
    mediaType: string;
    serviceVersion: string;
    title: string;
    url: string;
}

export default App;
