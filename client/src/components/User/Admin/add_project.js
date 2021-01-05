import React, { Component } from 'react';
import FormField from '../../ultils/Form/FormField';
import { update, generateData, ifFormValid, populateOptionFields,resetFields} from '../../ultils/Form/FormActions';
import UserLayout from '../../../hoc/user';
import {connect} from 'react-redux'
import {getBrands,getWoods,addProduct,clearProduct} from '../../../actions/product_actions'
import './AddProduct.scss'
import FileUpload from '../../ultils/FileUpload'

class AddProduct extends Component {
    state={
        formError: false,
        formSuccess: false,
        formData:{
            name:{
                element: 'input',
                value: '',
                config: {
                    label: 'Product Name',
                    name: 'name_input',
                    type: 'text',
                    placeholder: 'Enter product name'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '', 
                showlabel: true
            },
            description: {
                element: 'textarea',
                value: '',
                config: {
                    label: 'Product Description',
                    name: 'description_input',
                    type: 'text',
                    placeholder: 'Enter product description'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            price: {
                element: 'input',
                value: '',
                config: {
                    label: 'Product Price',
                    name: 'price_input',
                    type: 'number',
                    placeholder: 'Enter product description'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            brand: {
                element: 'select',
                value: '',
                config: {
                    label: 'Product Brand',
                    name: 'brands_input',
                    options:[]
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            shipping: {
                element: 'select',
                value: '',
                config: {
                    label: 'Shipping',
                    name: 'shipping_input',
                    options: [
                        {key:true,value:'Yes'},
                        {key:false,value: 'No'}
                    ]
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            available: {
                element: 'select',
                value: '',
                config: {
                    label: 'Available, in stock',
                    name: 'available_input',
                    options: [
                        { key: true, value: 'Yes' },
                        { key: false, value: 'No' }
                    ]
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            wood: {
                element: 'select',
                value: '',
                config: {
                    label: 'Wood Material',
                    name: 'wood_input',
                    options: []
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            frets: {
                element: 'select',
                value: '',
                config: {
                    label: 'Frets Material',
                    name: 'frets_input',
                    options: [
                        { key: 21, value: 21 },
                        { key: 22, value: 22 },
                        { key: 23, value: 23 },
                        { key: 24, value: 24 }
                    ]
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            publish: {
                element: 'select',
                value: '',
                config: {
                    label: 'Publish',
                    name: 'publish_input',
                    options: [
                        { key: true, value: 'Publish' },
                        { key: false, value: 'Hidden' },
                    
                    ]
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
            },
            images:{
                element: 'select',
                value: [],
                validation: {
                    required: false,
                },
                valid: true,
                touched: false,
                validationMessage: '',
                showlabel: false
            }
        }
    }
    
    updateFields = (newFormData) => {
        this.setState({
            formData:newFormData
        })
    }

    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'products');
        this.setState({
            formError: false,
            formData: newFormdata
        });
    }


    componentDidMount(){
        const formData = this.state.formData;

        this.props.dispatch(getBrands()).then(response =>{
            const newFormData = populateOptionFields(formData, this.props.products.brands,'brand')
            this.updateFields(newFormData)
        })

        this.props.dispatch(getWoods()).then(response => {
            const newFormData = populateOptionFields(formData, this.props.products.woods, 'wood')
            this.updateFields(newFormData)
        })
    }

    // submitForm = (event) => {

    //     event.preventDefault();

    //     let dataToSubmit = generateData(this.state.formData, 'products');

    //     let formIsValid = ifFormValid(this.state.formData, 'products');


    //     console.log(dataToSubmit);

    //     if (formIsValid) {
    //         console.log(dataToSubmit);
    //         this.props.dispatch(addProduct(dataToSubmit)).then(()=>{
    //             console.log(this.props.products);
    //             if(this.props.products.addProduct.success){
    //                 this.resetFielHandler();
    //             }else{
    //                 this.setState({formError: true})
    //             }
    //         })
    //     }

    //     else {
    //         this.setState({
    //             formError: true
    //         })

    //     }
    // }

    // resetFielHandler = () => {
    //     const newFormData = resetFields(this.state.formData,'products');
    //     this.setState({
    //         formSuccess: true
    //     });
    //     setTimeout(()=>{
    //         this.setState({
    //             formSuccess: false
    //         },()=>{this.props.dispatch(clearProduct())})
    //     },3000)
    // }

    imagesHandler = (images) =>{
        const newFormData = {
            ...this.state.formData
        }
        newFormData['images'].value = images;
        newFormData['images'].valid = true;
     
        this.setState({
            formData:newFormData
        })
        
        console.log(this.state.formData);
    }
    
    render() {
        return (
            <UserLayout>
            <div className="AddProduct_Form_Container">
                <h1>Add product</h1>
                <form onSubmit={(event)=>this.submitForm(event)}>
                    <div classname='form_image_field'>
                        <FileUpload
                            imagesHandler={(images) => this.imagesHandler(images)}
                            reset={this.state.formSuccess}
                        />
                    </div>
                    <div className='form_fields'>
                        <div className="form_devider">
                        
                            <FormField
                                id={'name'}
                                formData={this.state.formData.name}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            
                            <FormField
                                id={'price'}
                                formData={this.state.formData.price}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            <FormField
                                id={'brand'}
                                formData={this.state.formData.brand}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            <FormField
                                id={'wood'}
                                formData={this.state.formData.wood}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            <FormField
                                id={'description'}
                                formData={this.state.formData.description}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                        </div>
                        <div className="form_devider">
                        
                            <FormField
                                id={'shipping'}
                                formData={this.state.formData.shipping}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            <FormField
                                id={'available'}
                                formData={this.state.formData.available}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            <FormField
                                id={'frets'}
                                formData={this.state.formData.frets}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                        
                            <FormField
                                id={'publish'}
                                formData={this.state.formData.publish}
                                //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                change={(element) => this.updateForm(element)}
                            />
                            {this.state.formSuccess ? 
                                <div className="form_success">
                                    Success
                                </div>: ''
                            }
                        
                            <button className='create__button' onClick={(event) => { this.submitForm(event) }}>
                                Add product
                            </button>
                                {this.state.formError ?
                                    <div className="errorLabel">
                                        PLease check yoour data!
                                </div>
                                    : ''}
                            </div>
                    </div>
                </form>
            </div>
            </UserLayout>
        );
    }
}

const mapStateToProps = (state)=>{
    return {
        products: state.products
    }
}

export default connect(mapStateToProps)(AddProduct);