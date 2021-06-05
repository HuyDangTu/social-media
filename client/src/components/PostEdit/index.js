import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserLayout from '../../hoc/user';
import { withRouter } from 'react-router-dom';
import FormField from '../ultils/Form/FormField';
import { populateOptionFields, update, ifFormValid, generateData, resetFields } from '../ultils/Form/FormActions';
import FileUpload from '../ultils/FileUpload';
import './postEdit.scss';
import 'react-autocomplete-input/dist/bundle.css';
import { getAllTags, getUserTag } from '../../actions/tag_actions';
import { clearProduct, updatePost } from '../../actions/product_actions';
import Skeleton from '@material-ui/lab/Skeleton'
import MuiAlert from '@material-ui/lab/Alert';

class PostEdit extends Component {

    state = {
        inputValue: "",
        formError: false,
        formSuccess: false,
        formData: {
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
        },
    }

    populateInput(formData,description,userTags){

        const newFormdata = { ...formData };

        const newDescription = {
            ...newFormdata["description"]
        }

        const newUsertag = {
            ...newFormdata["userTag"]
        }

        newDescription.value = description
    
        let usertag = "";
        userTags.forEach((item)=>{
            usertag += "@"+item.userName + " "
        })

        newUsertag.value = usertag

        newFormdata["description"] = newDescription;
        newFormdata["userTag"] = newUsertag;

        this.setState({ formData: newFormdata });
    }

    updateFields = (newFormData) => {
        this.setState({
            formData: newFormData
        })
    }

    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'posts');
        this.setState({
            formError: false,
            formData: newFormdata
        });
    }

    updateFields = (newFormData) => {
        this.setState({
            formData: newFormData
        })
    }

    componentDidMount() {
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
                this.populateInput(formData, this.props.description, this.props.userTag)
        })
    }

    emojiToggle = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker });
    }

    onEmojiClick = (event, emojiObject) => {
        this.setState({ emojiObject: emojiObject });
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
            return [];
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
            return [];
        }
    }

    submitForm = (event) => {

        event.preventDefault();

        let data = generateData(this.state.formData, 'posts');
        let formIsValid = ifFormValid(this.state.formData, 'posts');

        let dataToSubmit = { ...data }
        dataToSubmit.postId = this.props.postId
        dataToSubmit.tags = this.findHashtags(data.description);
        dataToSubmit.userTag = this.findUserTag(data.userTag);

        if (formIsValid) {
            console.log(dataToSubmit);
            this.props.dispatch(updatePost(dataToSubmit,this.props.ActionType)).then(() => {
                console.log(this.props.products);
                if (this.props.products.updatePost) {
                    this.props.close();
                    this.props.handleSnackBar("Đã chỉnh sửa bài viết")
                } else {
                    this.setState({ formError: true })
                }
            })
        } else {
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

    render() {
        const props = this.props;
        return (
                <div className="edit_post">
                    <form class="create_post_form">
                        <div className="row no-gutters">
                            <div className='col-xl-12 no-gutters'>
                                {
                                this.state.formData.description.value == "" ? <Skeleton variant="rect" width={300} height={50} />:
                                    <FormField
                                        id={'description'}
                                        change={(element) => this.updateForm(element)}
                                        formData={this.state.formData.description}
                                    />
                                
                                }
                                <div className="field_container">
                                {this.state.formData.description.value == "" ? <Skeleton variant="rect" width={300} height={50}  /> :
                                    <FormField
                                        id={'userTag'}
                                        change={(element) => this.updateForm(element)}
                                        formData={this.state.formData.userTag}
                                    />
                                }
                                </div>
                                {
                                this.state.formData.description.value == "" ? <Skeleton variant="rect" width={300} height={50} /> :
                                    <div className="button_wrapper">
                                        <button className='cancel_button' onClick={() => {this.props.close()}}>Hủy</button>
                                        <button className='create_button' onClick={(event) => { this.submitForm(event)}}>Lưu</button>
                                
                                    </div>
                                }
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
export default connect(mapStateToProps)(withRouter(PostEdit));