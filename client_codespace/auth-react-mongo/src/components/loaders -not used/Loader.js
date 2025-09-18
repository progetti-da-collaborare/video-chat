import axios from 'axios'
import React, { useEffect, useState, useMemo, ReactNode, useRef } from 'react';
import OnLoadingUserData from './OnLoadingUserData'
import AboutUs from '../../data/about_us/lectors/Lectors'
import OnUserDataNotLoaded from './OnUserDataNotLoaded';
import OnUserDataEmpty from './OnUserDataEmpty';

//Каждому ресурсу для загрузки id/key (например нажатие кнопки - соответствующий id)
//Загрузка один раз
function Loader(props) {
  const DataLoading = 
    OnLoadingUserData({message: "Подождите, данные загружаются!"})(
    OnUserDataNotLoaded({message: "Данные не загружены!"})(
    OnUserDataEmpty({message: "Список данных пуст!", isMassive: !!props.isMassive})(props.format)));

    const [appState, setAppState] = useState(
      {
        loading: false
      }
    )
  
    if(!appState.loading) {
      setAppState({loading:true});
    }
//what is type for axios return?
   useEffect(() => {
      const apiUrl = props.url; 
      if(!loaded && appState.loading){
        axios.get(apiUrl).then((resp) => {
          const allPersons = resp.data;
          const newPeopleMap = {...masData.current};
          newPeopleMap[props.value] = {data:allPersons, loaded:true};
          masData.current = newPeopleMap;

          setAppState({
            loading: false
          });
        }).catch(function(e){
          console.log(e);
          masData.current[props.value] = {data:undefined, loaded:true};
          setAppState({loading:false});
        });}
        if(loaded && appState.loading){
            setAppState({loading:false});
        }
    }, [appState]);
  
  
    return (
      <div>
          <DataLoading isLoading={appState} />
      </div>
    );
  }
  
  export default Loader;