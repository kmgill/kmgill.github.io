#!/bin/bash


XPLANET_HOME=/srv/www/planetmaker.wthr.us/html/img/xplanet/
XPLANET_URL=http://xplanetclouds.com/free/local/clouds_2048.jpg
TMP_IMAGE=clouds_2048_tmp.jpg
TMP_IMAGE_MASK=image_mask.png
TMP_NEGATED_IMAGE=clouds_ao_2048_tmp.jpg
TMP_TEXTURE=clouds_xplanet_texture_2048x1024_tmp.png
TMP_AO=clouds_ao_2048_tmp.jpg
TMP_MASK=image_mask.png
TMP_MASK_C1=image_mask-1.png
FINAL_IMAGE=clouds_2048.jpg
FINAL_TEXTURE=clouds_xplanet_texture_2048x1024.png
FINAL_AO=clouds_ao_2048.jpg
WGET_MAX_TRIES=10

MAX_HISTORY=30

if [ "x$1" != "x" ]; then
	XPLANET_HOME=$1
fi
echo xPlanet Home: $XPLANET_HOME

function check_exists() {
	dir=$1
	
	if [ ! -d ${dir} ]; then
		mkdir ${dir}
	fi
}

function move_image_back_in_history() {
	image=$1
	current=$2
	let next=$current+1
	
	if [ $next -lt $MAX_HISTORY -a -f $current/$image ]; then
		check_exists $next
		mv -f $current/$image $next/$image
	fi
}

function move_images_back_in_history() {
	current=$1
	move_image_back_in_history $FINAL_IMAGE $current
	move_image_back_in_history $FINAL_TEXTURE $current
	move_image_back_in_history $FINAL_AO $current
}

function increment_image_history() {
	let i=$MAX_HISTORY-2
	while [ $i -ge 0 ]; do
		move_image_back_in_history $FINAL_IMAGE $i
		move_image_back_in_history $FINAL_TEXTURE $i
		move_image_back_in_history $FINAL_AO $i
		let i=$i-1
	done
	
	check_exists 0
	
	cp -f $FINAL_IMAGE 0/$FINAL_IMAGE
	cp -f $FINAL_TEXTURE 0/$FINAL_TEXTURE
	cp -f $FINAL_AO 0/$FINAL_AO
}


function download_xplanet_image() {
	let i=0
	while [ $i -lt $WGET_MAX_TRIES ]; do
		wget $XPLANET_URL -O $TMP_IMAGE
		if [ $? -eq 0 ]; then
			return 0
		fi
		echo "Request $i failed, trying again"
		let i=$i+1
	done
	return 1
}


cd $XPLANET_HOME

echo "Downloading XPlanet Clouds Image..."
download_xplanet_image
if [ $? -ne 0 ]; then
	echo "Failed to retrieve XPlanet clouds after $WGET_MAX_TRIES tries. Exiting."
	exit 1
fi

echo "Seperating RGB Colorspace..."
convert $TMP_IMAGE  -colorspace RGB -separate $TMP_MASK
if [ $? -ne 0 ]; then
	echo "Failed to seperate RGB colorspace. Exiting."
	exit 1
fi

echo "Creating Texture With Alpha-Channel..."
convert $TMP_IMAGE -alpha Off $TMP_MASK_C1 -compose CopyOpacity -composite PNG32:$TMP_TEXTURE
if [ $? -ne 0 ]; then
	echo "Failed to create transparent texture. Exiting."
	exit 1
fi

echo "Creating AO Texture..."
convert $TMP_IMAGE -negate $TMP_AO
if [ $? -ne 0 ]; then
	echo "Failed to create AO texture. Exiting."
	exit 1
fi

echo "Publishing New Clouds Images..."
if [ -f "$TMP_IMAGE" ]; then
	mv -f $TMP_IMAGE $FINAL_IMAGE
fi

if [ -f "$TMP_TEXTURE" ]; then
	mv -f $TMP_TEXTURE $FINAL_TEXTURE
fi

if [ -f "$TMP_AO" ]; then
	mv -f $TMP_AO $FINAL_AO
fi

echo "Updating Image History Archives..."
increment_image_history


echo "Cleaning Up..."
rm -f image_mask*png
