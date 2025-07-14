const sampleObj =
{
    JAVASCRIPT: "const readline = require('readline');\n\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet inputLines = [];\n\nrl.on('line', (line) => {\n    inputLines = line.split(' ');\n    rl.close();\n}).on('close', () => {\n    const a = parseInt(inputLines[0], 10);\n    const b = parseInt(inputLines[1], 10);\n    console.log(a + b);\n});",
    PYTHON: "import sys\ninput_line = sys.stdin.read()\na, b = map(int, input_line.split())\nprint(a + b)",
    JAVA: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}"
};

for(const [language, codeSnippet] of Object.entries(sampleObj)){
    console.log(`Language: ${language}`);
    console.log(`Code Snippet: ${codeSnippet}`);
    console.log('--------------------------');
};

