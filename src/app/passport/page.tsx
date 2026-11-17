import type {Metadata} from 'next';
import {WorldPassport} from '@/components/world-passport';

export const metadata:Metadata={
 title:'Xucuz Passport — personal world atlas',
 description:'Explore selected cities and save personal discovery stamps in your browser.',
};

export default function PassportPage(){return <WorldPassport/>;}
