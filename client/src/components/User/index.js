import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../hoc/layout';
import { Link, withRouter } from 'react-router-dom';
import FormField from '../ultils/Form/FormField';
import { populateOptionFields, update, ifFormValid, generateData, resetFields} from '../ultils/Form/FormActions';
import FileUpload from '../ultils/FileUpload';
import './createPostForm.scss';
import 'react-autocomplete-input/dist/bundle.css';
import { getAllTags, getUserTag } from '../../actions/tag_actions';
import { clearProduct, createPost  } from '../../actions/product_actions';
import SearchLocationInput from '../SearchLocationInput/SearchLocationInput'
import { startSession } from 'mongoose';

class UserDashboard extends Component {

    state={
        inputValue : "",
        formError: false,
        formSuccess: false,
        formData:{
            description: {
                element: 'description',
                value: '',
                config: {
                    placeholder: 'Nói gì đó về bài viết này.....',
                    label: 'Mô tả',
                    name: 'description',
                    options: [],
                },
                validation: {
                    required: false,
                },
                valid: true,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
            userTag: {
                element: 'userTag',
                value: '',
                config: {
                    placeholder: 'Gắn thẻ bạn bè',
                    label: 'Gắn thẻ',
                    name: 'userTag',
                    options: [],
                },
                validation: {
                    required: false,
                },
                valid: true,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
            locationInput: {
                element: 'locationInput',
                value: '',
                config: {
                    placeholder: 'Thêm vị trí',
                    label: 'Vị trí',
                    name: 'location',
                    options: [],
                },
                validation: {
                    required: false,
                },
                valid: true,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
            images: {
                element: 'select',
                value: [],
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            }
        },
    }

    updateFields = (newFormData) => {
        this.setState({
            formData: newFormData
        })
    }

    updateDescription = (newFormdata) =>{
        this.setState((prevState) => ({ formError: false, formData: newFormdata }));
    }
    
    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'posts');
        console.log(newFormdata);
        this.updateDescription(newFormdata)
    }

    updateFields = (newFormData) => {
        this.setState({
            formData: newFormData
        })
    }

    componentDidMount(){
        const formData = this.state.formData;
        //Gọi API lấy danh sách thẻ
        this.props.dispatch(getAllTags())
        .then(response => {
            const newFormData = populateOptionFields(formData, this.props.tags.allTags, 'description')
            this.updateFields(newFormData)
        })
        this.props.dispatch(getUserTag())
        .then(response => {
            const newFormData = populateOptionFields(formData, this.props.tags.userTags, 'userTag')
            this.updateFields(newFormData)
        })
    }

    imagesHandler = (images) => {
        const newFormData = {
            ...this.state.formData
        }
        newFormData['images'].value = images;

        images.length ?
        newFormData['images'].valid = true
        : newFormData['images'].valid = false

        this.setState({
            formData: newFormData
        })

        console.log(this.state.formData);
    }

    emojiToggle = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker});
    }

    onEmojiClick = (event, emojiObject) => {
        this.setState({ emojiObject: emojiObject});
    }

    findHashtags(Text) {
        var regexp = /\B\#\w\w+\b/g
        let result = Text.match(regexp);
        
        if (result) {
            let tags = []; 
            result.forEach((item) => {
                tags.push(item.slice(1));
            })
            return (tags);
        } else {
            return false;
        }
    }

    findUserTag(Text) {
        var regexp = /\B\@\w\w+\b/g
        let result = Text.match(regexp);
       
        if (result) {
            let userTag = []
            result.forEach((item) => {
                userTag.push(item.slice(1));
            })
            return (userTag);
        } else {
            return false;
        }
    }

    submitForm = (event) => {

        event.preventDefault();
        
        let data = generateData(this.state.formData, 'posts');
        let formIsValid = ifFormValid(this.state.formData, 'posts');

        let dataToSubmit = {...data}
        dataToSubmit.tags = this.findHashtags(data.description);
        dataToSubmit.userTag = this.findUserTag(data.userTag);
        
        if (formIsValid) {
            console.log(dataToSubmit);
            this.props.dispatch(createPost(dataToSubmit)).then(() => {
                console.log(this.props.products);
                if (this.props.products.addProduct.success) {
                    this.props.history.push('/newfeed')
                } else {
                    this.setState({ formError: true })
                }
            })
        }else {
            this.setState({
                formError: true
            })
        }
    }

    resetFieldHandler = () => {
        
        const newFormData = resetFields(this.state.formData, 'posts');
        this.setState({
            formSuccess: true
        });
        setTimeout(() => {
            this.setState({
                formSuccess: false
            }, () => { this.props.dispatch(clearProduct()) })
        }, 3000)
    }

    render(){
        const props = this.props;
        return (
            <Layout>
                <div className="create_post">
                    <form class="create_post_form">
                        <div className="row no-gutters">
                            <div className='col-xl-12 col-sm-12 col-12 no-gutters'>
                                <div className="user_info">
                                    <img className="avatar" src={props.user.userData.avt}/>
                                    <h5 className="userName">{props.user.userData.userName}</h5>
                                </div>
                                <FormField
                                    id={'description'}
                                    change={(element) => this.updateForm(element)}
                                    formData={this.state.formData.description}
                                />
                                <div className="field_container">
                                <FormField
                                    id={'userTag'}
                                    change={(element) => this.updateForm(element)}
                                    formData={this.state.formData.userTag}
                                />
                                </div>
                                <FileUpload
                                    imagesHandler={(images) => this.imagesHandler(images)}
                                    reset={this.state.formSuccess}
                                />
                                <button className='create_button' onClick={(event) => { this.submitForm(event) }}>Đăng bài</button>
                                {
                                    this.state.formError ?
                                    <p>Hãy thêm ảnh để đăng bài nhé :( </p>
                                    : <p></p>
                                }
                            </div>
                        </div>
                   </form>
                    {/* <div>
                        <SearchLocationInput onChange={() => {}}/>
                    </div> */}
                </div>
            </Layout>
        );
    }
}
function mapStateToProps(state) {
    return {
        user: state.user,
        tags: state.tags,
        products: state.products,
    }
}
export default connect(mapStateToProps)(withRouter(UserDashboard));