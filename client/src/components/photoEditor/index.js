import React, {useEffect,useState} from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import './photoEditor.scss';
import {createStory} from '../../actions/product_actions';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useHistory } from "react-router-dom";
import { useStore, useDispatch } from 'react-redux';

const myTheme = {
  // Theme object to extends default dark theme.
};
// var pngUrl = canvas.toDataURL(); // PNG is the default

const PhotoEditor = (props) => {
    
    let history = useHistory();
    const store = useStore()
    const state = store.getState();
    const dispatch = useDispatch();

    function handleClick() {
        history.push("/newfeed");
    }

    const [isLoading,setIsLoading] = useState(props.isLoading);
    // const [errors, setErrors] = useState(0);
    
    useEffect(() => {
        setIsLoading(props.isLoading);
    }, [props.isLoading]);

    return (
        <div className={`photoEditor ${isLoading ? "disable" : ""}`} >
            <div class="header" >
                <div className="header-wrapper">
                    <button className="btn btn-cancel" onClick={()=>props.close()}>Cancel</button>
                    <div className="header__logo" onClick={handleClick}>
                        <img class="Logo_stunn"src={require('../../asset/logo/logo2x.png')} />
                        <img class="Logo_text" src={require('../../asset/logo/stunn2x.png')} />
                    </div>
                    <button className="btn btn-complete" onClick={()=>{
                        var list = document.getElementsByTagName("canvas")
                        var dataURL = list[0].toDataURL('image/jpeg', 1.0);
                        setIsLoading(true);
                        dispatch(createStory(dataURL,state.user.userData._id)).then((response) => {
                            console.log(response)
                            if(response.payload.success)
                            {   props.onSuccess()
                                setIsLoading(false);
                            }
                            else{
                                console.log("ERROR")
                            }
                        })
                    }}>Post to story</button>
                </div>
                {
                    !isLoading ? ""
                    :<div className="LinearProcess">
                        <LinearProgress />
                    </div>
                }
            </div>
            
            <ImageEditor
                includeUI={{
                    loadImage: {
                        path: 'https://images.unsplash.com/photo-1616627690613-75df07578b45?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                        name: 'SampleImage',
                    },
                    theme: myTheme,
                    menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
                    initMenu: 'filter',
                    uiSize: {
                        width: 'auto',
                        height: '100vh',
                    },
                    menuBarPosition: 'right',
                }}
                cssMaxHeight={500}
                cssMaxWidth={700}
                selectionStyle={{
                    cornerSize: 20,
                    rotatingPointOffset: 70,
                }}
                usageStatistics={true}
            />
        </div>
    );
};

export default PhotoEditor;