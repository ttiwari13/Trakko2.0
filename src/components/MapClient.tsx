"use client";

import dynamic from "next/dynamic"; //its job is lazy loading components

const Map=dynamic(()=>import("./Map"),{ssr:false});
export default function MapClient(){
 return <Map/>;
}
