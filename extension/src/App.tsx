import { ChakraProvider } from "@chakra-ui/react";
import { Route, MemoryRouter as Router, Switch } from "react-router-dom";
import "./App.css";
import { NAVIGATION } from "./consts/consts";
import { Enhanchment, Exports, Welcome } from "./pages";
import Navbar from "./pages/compoments/navbar";
// import ExplicitPage from "./components/Explicit";
// import FacebookPage from "./components/Facebook";
// import RedditPage from "./components/Reddit";
// import SettingsPage from "./components/Settings";
// import TwitterPage from "./components/Twitter";
// import WelcomePage from "./components/WelcomePage";
// import YoutubePage from "./components/Youtube";

function App() {
    //     const [showWelcomePage, setShowWelcomePage] = useState(true);
    //     const [selectedIcon, setSelectedIcon] = useState("icon1");
    //     const [data, setData] = useState([]);
    //     const [loading, setLoading] = useState(false);
    //     useEffect(() => {
    //         // Check if the welcome page has been visited before
    //         const hasVisitedWelcomePage = localStorage.getItem(
    //             "hasVisitedWelcomePage"
    //         );
    //         if (hasVisitedWelcomePage) {
    //             setShowWelcomePage(false); // Don't show the WelcomePage if it has been visited before
    //         }

    //         chrome.storage.sync.get("siteData", (res: any) => {
    //             if (res.siteData[5].settings["disable-10"].value) {
    //                 const storedTimeStr = res.siteData[5].settings["disable-10"].from;
    //                 const storedTime: any = new Date(storedTimeStr);
    //                 const currentTime: any = new Date();
    //                 const timeDifferenceInMs = currentTime - storedTime;
    //                 const tenMinutesInMs = 1000 * 60 * 10;
    //                 if (timeDifferenceInMs > tenMinutesInMs) {
    //                     res.siteData[5].settings["disable-10"].value = false;
    //                     sendData(res);
    //                 }
    //             }
    //             if (res.siteData[5].settings.disableHours.active) {
    //                 const mhd = res.siteData[5].settings.disableHours["m/h/d"];
    //                 const storedTimeStr=res.siteData[5].settings.disableHours.from;
    //                 const storedTime: any = new Date(storedTimeStr);
    //                 const currentTime: any = new Date();
    //                 const timeDifference = currentTime - storedTime;
    //                 const storedValue=parseInt(res.siteData[5].settings.disableHours.value,10);
    //                 let Time;
    //                 if (mhd=="m") {
    //                     Time = 1000 * 60 * storedValue;
    //                 }
    //                 else if(mhd=="h"){
    //                     Time=1000*60*60*storedValue;
    //                 }
    //                 else{
    //                     Time=1000*60*60*24*storedValue;
    //                 }
    //                 if (timeDifference > Time) {
    //                     res.siteData[5].settings.disableHours.value = "";
    //                     res.siteData[5].settings.disableHours.active = false;
    //                     res.siteData[5].settings.disableHours["m/h/d"] = "m";
    //                     sendData(res);
    //                 }
    //             }
    //             setData(res);
    //         });
    //     }, []);
    //     const sendData = async (data: any) => {
    //         const sendData = { action: "storeData", data: data };
    //         await chrome.runtime.sendMessage(sendData);
    //     };
    //     useEffect(() => {
    //         setData(data);
    //     }, [data])
    return (
        <ChakraProvider>
            <Router>
                <Navbar />
                <Switch>
                    <Route exact path={NAVIGATION.WELCOME}>
                        <Welcome />
                    </Route>
                    <Route path={NAVIGATION.ENHANCEMENT}>
                        <Enhanchment />
                    </Route>
                    <Route path={NAVIGATION.EXPORT}>
                        <Exports />
                    </Route>
                    {/* <Route path="/youtube">
                        <YoutubePage
                            selectedIcon={selectedIcon}
                            setSelectedIcon={setSelectedIcon}
                            data={data}
                            setData={setData}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </Route>
                    <Route path="/reddit">
                        <RedditPage
                            selectedIcon={selectedIcon}
                            setSelectedIcon={setSelectedIcon}
                            data={data}
                            setData={setData}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </Route>
                    <Route path="/twitter">
                        <TwitterPage
                            selectedIcon={selectedIcon}
                            setSelectedIcon={setSelectedIcon}
                            data={data}
                            setData={setData}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </Route>
                    <Route path="/explicit">
                        <ExplicitPage
                            selectedIcon={selectedIcon}
                            setSelectedIcon={setSelectedIcon}
                            data={data}
                            setData={setData}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </Route>
                    <Route path="/settings">
                        <SettingsPage
                            selectedIcon={selectedIcon}
                            setSelectedIcon={setSelectedIcon}
                            data={data}
                            setData={setData}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </Route> */}
                </Switch>
            </Router>
        </ChakraProvider>
    );
}

export default App;
