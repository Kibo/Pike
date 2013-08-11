var DIALOGUE_DATA = {
	guard:{
		"actors": [
		   		{
		   			"id": 10,
		   			"name": "guard"
		   		},
		   		{
		   			"id": 20,
		   			"name": "hero"
		   		}
		   	],
		   	"dialogues": [
		   		{
		   			"id": 5,
		   			"parent": null,
		   			"isChoice": true,
		   			"conditionsString": "",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": [
		   				10,
		   				100
		   			]
		   		},
		   		{
		   			"id": 10,
		   			"parent": 5,
		   			"isChoice": false,
		   			"actor": 20,
		   			"conversant": 10,
		   			"menuText": "say hello",
		   			"dialogueText": "Hello guard.",
		   			"conditionsString": "",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": [
		   				30
		   			]
		   		},
		   		{
		   			"id": 30,
		   			"parent": 10,
		   			"isChoice": false,
		   			"actor": 10,
		   			"conversant": 20,
		   			"menuText": "",
		   			"dialogueText": "Can you help me with English exercises?",
		   			"conditionsString": "!this.isPracticeFinished()",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": [
		   				40
		   			]
		   		},
		   		{
		   			"id": 40,
		   			"parent": 30,
		   			"isChoice": true,
		   			"conditionsString": "!this.isPracticeFinished()",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": [
		   				50,
		   				60
		   			]
		   		},
		   		{
		   			"id": 50,
		   			"parent": 40,
		   			"isChoice": false,
		   			"actor": 20,
		   			"conversant": 10,
		   			"menuText": "Yes",
		   			"dialogueText": "Ok, show me ther exercises.",
		   			"conditionsString": "",
		   			"codeBefore": "",
		   			"codeAfter": "document.getElementById('pike-practice').style.top='0'; this.showPractice();",
		   			"outgoingLinks": []
		   		},
		   		{
		   			"id": 60,
		   			"parent": 40,
		   			"isChoice": false,
		   			"actor": 20,
		   			"conversant": 10,
		   			"menuText": "No",
		   			"dialogueText": "I have no time.",
		   			"conditionsString": "",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": []
		   		},
		   		{
		   			"id": 100,
		   			"parent": 5,
		   			"isChoice": false,
		   			"actor": 20,
		   			"conversant": 10,
		   			"menuText": "present exercise",
		   			"dialogueText": "There are your exercise.",
		   			"conditionsString":"this.isPracticeFinished() && !this.findDialogueById(100).passThrough",
		   			"codeBefore": "",
		   			"codeAfter": "this.getDialogue().passThrough=true",
		   			"outgoingLinks": [
		   				110
		   			]
		   		},
		   		{
		   			"id": 110,
		   			"parent": 100,
		   			"isChoice": false,
		   			"actor": 10,
		   			"conversant": 20,
		   			"menuText": "",
		   			"dialogueText": "Thanks a lot.",
		   			"conditionsString": "!this.hasPracticeError()",
		   			"codeBefore": "",
		   			"codeAfter": "this.openGate();",
		   			"outgoingLinks": [
		   				120
		   			]
		   		},
		   		{
		   			"id": 120,
		   			"parent": 110,
		   			"isChoice": false,
		   			"actor": 10,
		   			"conversant": 20,
		   			"menuText": "",
		   			"dialogueText": "but... there are mistakes!",
		   			"conditionsString": "this.hasPracticeError()",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": [
		   				130
		   			]
		   		},
		   		{
		   			"id": 130,
		   			"parent": 120,
		   			"isChoice": false,
		   			"actor": 20,
		   			"conversant": 10,
		   			"menuText": "",
		   			"dialogueText": "Sorry!",
		   			"conditionsString": "this.hasPracticeError()",
		   			"codeBefore": "",
		   			"codeAfter": "",
		   			"outgoingLinks": []
		   		}
		   	]	
	}
};
