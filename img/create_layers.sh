#!/bin/bash


function do_convert()
{
	full_size=${1}8192x4096${2}
	new_file=${1}${3}${2}

	echo Creating $new_file
	convert $full_size -resize ${3} $new_file
}

base_name=${1}
echo Base Name: $base_name

if [ "x${2}" != "x" ]; then
	extension=${2}
else
	extension=".jpg"
fi
echo Extension: $extension

do_convert $base_name $extension 4096x2048
do_convert $base_name $extension 2048x1024
do_convert $base_name $extension 1024x512
do_convert $base_name $extension 512x256
do_convert $base_name $extension 256x128



