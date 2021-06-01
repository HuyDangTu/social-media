import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import { getMessage, getConversation, sendMessage, seenMessage, sendimg} from '../../../src/actions/message_action'
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Trash, ridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, CircleX, Heart, Message2, Bookmark, Pencil, Search, Point, Photo, Sticker, Send } from 'tabler-icons-react'
import Pusher from 'pusher-js'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Button, LinearProgress } from '@material-ui/core';
import styled from 'styled-components'
class NewMess extends Component{
    
}