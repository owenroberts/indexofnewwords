import sys
reload(sys)
sys.setdefaultencoding('utf8')
import nltk
import random
from markov import MarkovGenerator

text = "quarter-stein"

prefix_file = open("../pref.txt")
prefixes = prefix_file.readlines()

file = open(text+".txt")
#lines = [line.decode('utf-8').strip() for line in file.readlines()]
lines = file.readlines()

nountypes = ["NN", "NNP", "NNS", "NNPS"]
punc = [".",",",";","?","-",]

newlines = ""
for line in lines:
	tokens = nltk.word_tokenize(line)
	tagged = nltk.pos_tag(tokens)
	newline = line
	for idx, tag in enumerate(tagged):
		if any(tag[1] in n for n in nountypes):
			newword = random.choice(prefixes).rstrip().lower() + tag[0]
			newline = newline.replace(tag[0], newword)

	newlines += newline
	newlines += "\n"


generator = MarkovGenerator(n=1, max=1000)
generator.feed(newlines)
genpoem = generator.generate()

f = open(text+"-pref.txt", "w")
f.write(newlines)
f.close()
p = open(text+"-markov.txt", "w")
p.write(genpoem)
p.close()