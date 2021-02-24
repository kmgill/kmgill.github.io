#!/usr/bin/env python
# build.py - JavaScript build automation. Based on build used by three.js

MANIFEST_JSON = "Manifest.json"

import sys

#if sys.version_info < (2, 7):
#	print("This script requires at least Python 2.7.")
#	print("Please, update to a newer version: http://www.python.org/download/releases/")
#	exit()

import argparse
import json
import os
import shutil
import tempfile
import time
from datetime import datetime


class ManifestEntry:

	def __init__(self, entry):
		self.standardOutput = entry["output"]["standard"]
		self.minifiedOutput = entry["output"]["minified"]
		
		self.includes = entry["includes"]
	
	def getLastModifiedTime(self):
		last = 0
		
		for filePath in self.includes:
			mtime = os.path.getmtime(filePath)
			if mtime > last:
				last = mtime
		
		return last
	
	def __readFile(self, filePath):
		fp = open(filePath, "r")
		lines = fp.readlines()
		fp.close()
		return lines
	
	def __writeLines(self, fp, lines, fileName):
		fp.write("\n/* File: %s */\n"%fileName)
		for line in lines:
			fp.write(line)
	
	def __minifyFile(self, inFilePath, outFilePath):
		print "Minifying %s to %s"%(inFilePath, outFilePath),
		cmd = 'java -jar compiler/compiler.jar --warning_level=VERBOSE --compilation_level SIMPLE_OPTIMIZATIONS --jscomp_off=checkTypes --externs Externs.js --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s' % (inFilePath, outFilePath)
		os.system(cmd)
		print "Done"
	
	
	def __compile(self, includes, outpath, minpath, skipminify):
		outFile = open(outpath, "w")
	
		for file in includes:
			print "Loading file", file, "into", outpath, 
			lines = self.__readFile(file)
			self.__writeLines(outFile, lines, file)
			print "Done"
		outFile.close()
		
		if not skipminify and minpath != None and len(minpath) > 0:
			self.__minifyFile(outpath, minpath)
	
	def compile(self, skipminify, createnodejs=False):
		self.__compile(self.includes, self.standardOutput, self.minifiedOutput, skipminify)
		
		if createnodejs:
			includes = self.includes[:]
			includes.insert(0, "Externs.js")
			self.__compile(includes, "%s.node.js"%self.standardOutput, None, True)

	

	
def watch(entries, args):
	lastBuiltChange = 0
	buildCount = 0
	while True:
		lastModified = lastBuiltChange
		
		for entry in entries:
			last = entry.getLastModifiedTime()
			if last > lastModified:
				lastModified = last
		
		if lastModified > lastBuiltChange:
			print "Change detected, building..."
			for entry in entries:
				entry.compile(args.skipminify, args.createnodejs)
			lastBuiltChange = lastModified
			buildCount += 1
			print "Completed build #", buildCount, "at", datetime.now()

		time.sleep(.5)


	
if __name__ == "__main__":
	
	
	parser = argparse.ArgumentParser()
	parser.add_argument('--skipminify', action='store_true', default=False)
	parser.add_argument('--watch', action='store_true', default=False)
	parser.add_argument('--createnodejs', action='store_true', default=False)
	args = parser.parse_args()

	fp = open(MANIFEST_JSON, "r")
	manifest = json.load(fp)
	fp.close()
	
	entries = []
	
	for manifestEntry in manifest:
		entry = ManifestEntry(manifestEntry)
		entry.compile(args.skipminify, args.createnodejs)
		entries.append(entry)
	
	if args.watch:
		watch(entries, args)
