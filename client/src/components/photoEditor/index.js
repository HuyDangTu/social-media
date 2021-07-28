import React, {useEffect,useState} from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import './photoEditor.scss';
import {createStory} from '../../actions/product_actions';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useHistory } from "react-router-dom";
import { useStore, useDispatch } from 'react-redux';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

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
    const [isEmpty,setIsEmpty] = useState(false);

    // const [errors, setErrors] = useState(0);
    
    useEffect(() => {
        setIsLoading(props.isLoading);
    }, [props.isLoading]);

    useEffect(() => {
        setIsEmpty(props.isEmpty);
    }, [props.isEmpty]);

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
                        if(dataURL == `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAJYBLAMBEQACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAC//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8An/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k=`){
                            //console.log("ERROR")
                            setIsEmpty(true);
                        }else{
                            //console.log("SUCCESS")
                            setIsLoading(true);
                            dispatch(createStory(dataURL,state.user.userData._id)).then((response) => {
                                console.log(response)
                                if(response.payload.success)
                                {   
                                    props.onSuccess()
                                    setIsLoading(false);
                                }
                                else{
                                    setIsLoading(false);
                                    setIsEmpty(true);
                                }
                            })
                        }
                    }}>Add</button>
                </div>
                {
                    !isLoading ? ""
                    :<div className="LinearProcess">
                        <LinearProgress />
                    </div>
                }
            </div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                open={isEmpty}
                onClose={() => setIsEmpty(false)}
                autoHideDuration={2000}
            >
                    <MuiAlert elevation={6} variant="filled" severity={"error"} >Kiểm tra và thử lại!</MuiAlert>
            </Snackbar>
            <ImageEditor
                includeUI={{
                    loadImage: {
                        path: '',
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
    
            <div className="message"> Photo editor is not support small screen device!</div>
        </div>
    );
};

export default PhotoEditor;