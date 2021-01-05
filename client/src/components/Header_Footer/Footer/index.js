import React from 'react';
import './footer.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faCompass from '@fortawesome/fontawesome-free-solid/faCompass';
import faPhone from '@fortawesome/fontawesome-free-solid/faPhone';
import faClock from '@fortawesome/fontawesome-free-solid/faClock';
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope';

const Footer = () => {
    return ( 
        <div className="footer container-fluid" >
            <div className="footer__container container-fluid"> 
                <div className="row no-gutters">
                    <div className="col-xl-3 no-gutters">
                        <div className="footer__container__left">
                            <h4>Contact</h4>
                            <div className="bussiness-info">
                            
                                    <div className="tag">
                                        
                                        <div className="nfo">
                                            <div>  <FontAwesomeIcon
                                                icon={faCompass}
                                        />  34 Nguyen Hue Street, District 1</div>
                                        </div>
                                    </div>
                                    <div className="tag">
                                    <div className="nfo">
                                            <div><FontAwesomeIcon
                                                icon={faPhone}
                                        /> (+34)99856732</div>
                                       
                                    </div>
                                </div>

                                    <div className="tag">
                                       
                                        <div className="nfo">
                                            <div> <FontAwesomeIcon
                                                icon={faClock}
                                        /> 8AM-9PM</div>
                                            
                                        </div>
                                    </div>
                                    <div className="tag">
                                    
                                    <div className="nfo">
                                        <div> <FontAwesomeIcon
                                        icon={faEnvelope}
                                        /> Plant@gmail.com</div>
                                        
                                    </div>
                                </div>
                               
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 no-gutters">
                        <div className="footer__container__left">
                            <h4>Company</h4>
                            <div className="bussiness-info">

                                <div className="tag">
                                  <div className="nfo">
                                        <div>About us</div>
                                    </div>
                                </div>
                                <div className="tag">
                                    <div className="nfo">
                                        <div>Blog</div>
                                    </div>
                                </div>

                                <div className="tag">

                                    <div className="nfo">
                                   
                                        <div>History</div>
                                    </div>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 no-gutters">
                        <div className="footer__container__left">
                            <h4>Support</h4>
                            <div className="bussiness-info">

                                <div className="tag">
                                    <div className="nfo">
                                        <div>Support Center</div>
                                    </div>
                                </div>
                                <div className="tag">
                                    <div className="nfo">
                                        <div>Shipping & Delivery</div>
                                    </div>
                                </div>

                                <div className="tag">

                                    <div className="nfo">

                                        <div>Returns</div>
                                    </div>
                                </div>
                                <div className="tag">

                                    <div className="nfo">

                                        <div>Help</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 no-gutters">
                        <div className="footer__container__left">
                            <h4>Work with us</h4>
                            <div className="bussiness-info">
                                <div className="tag">
                                    <div className="nfo">
                                        <div>Careers</div>
                                    </div>
                                </div>
                                <div className="tag">
                                    <div className="nfo">
                                        <div>Jobs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;