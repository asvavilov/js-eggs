var box2dprofi = function()
{
	// Keep a reference to the Box2D World
	var world;

	// The scale between Box2D units and pixels
	var SCALE = 30;

	// Multiply to convert degrees to radians.
	var D2R = Math.PI / 180;

	// Multiply to convert radians to degrees.
	var R2D = 180 / Math.PI;

	// 360 degrees in radians.
	var PI2 = Math.PI * 2;

	//Cache the canvas DOM reference
	var canvas;
	var canvas_id;

	//Are we debug drawing
	var debug = false;

	// Shorthand "imports"
	var b2Vec2 = Box2D.Common.Math.b2Vec2,
		b2BodyDef = Box2D.Dynamics.b2BodyDef,
		b2AABB = Box2D.Collision.b2AABB,
		b2Body = Box2D.Dynamics.b2Body,
		b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
		b2Fixture = Box2D.Dynamics.b2Fixture,
		b2World = Box2D.Dynamics.b2World,
		b2MassData = Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
		b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
		b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;
	
	var selector = null;

	this.init = function (selector_str, canvas_id_str) {
		
		selector = selector_str;
		canvas_id = canvas_id_str;

		//Create the Box2D World with horisontal and vertical gravity (10 is close enough to 9.8)
		world = new b2World(
			new b2Vec2(0, 10) //gravity
			, true //allow sleep
		);

		//setup debug draw
		var debugDraw = new b2DebugDraw();
		canvas = document.getElementById(canvas_id);
		debugDraw.SetSprite(canvas.getContext("2d"));
		debugDraw.SetDrawScale(SCALE);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		world.SetDebugDraw(debugDraw);

		//Create DOB OBjects
		createDOMObjects();

		//Make sure that the screen canvas for debug drawing matches the window size
		resizeHandler();
		window.addEventListener('resize', resizeHandler);

		//Create the ground
		var w = document.documentElement.offsetWidth; 
		var h = document.documentElement.offsetHeight;

		createBox(0, h , w, 5, true);
		createBox(0,0,5,h, true);
		createBox(w,0,5,h, true);

		//Do one animation interation and start animating
		update();
	}

	function createDOMObjects() {
		//iterate all div elements and create them in the Box2D system
		Array.prototype.forEach.call(document.querySelectorAll(selector), function (el,i) {
			var width = el.offsetWidth / 2 ;
			var height = el.offsetHeight / 2
			
            var x = (el.offsetLeft) + width;
            var y = (el.offsetTop) + height;
            var body = createBox(x,y,width,height);
			body.m_userData = {domObj:el, width:width, height:height};
			
			//Reset DOM object position for use with CSS3 positioning
			el.style.left = '0px';
			el.style.top = '0px';
			el.position = 'absolute';
			
		});
	}

	function createBox(x,y,width,height, isstatic) {
		var bodyDef = new b2BodyDef;
		bodyDef.type = isstatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
		bodyDef.position.x = x / SCALE;
		bodyDef.position.y = y / SCALE

		var fixDef = new b2FixtureDef;
     	fixDef.density = 1.5;
     	fixDef.friction = 0.3;
     	fixDef.restitution = 0.4;

		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
		return world.CreateBody(bodyDef).CreateFixture(fixDef);
	}
	
	//Animate DOM objects
	function drawDOMObjects() {
		var i = 0;
		for (var b = world.m_bodyList; b; b = b.m_next) {
			for (var f = b.m_fixtureList; f; f = f.m_next) {
				if (f.m_userData) {
					//Retrieve positions and rotations from the Box2d world
					var x = Math.floor((f.m_body.m_xf.position.x * SCALE) - f.m_userData.width);
					var y = Math.floor((f.m_body.m_xf.position.y * SCALE) - f.m_userData.height);
			
					//CSS3 transform does not like negative values or infitate decimals
					var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
			
					var css_transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)';
			
					if (typeof(f.m_userData.domObj.style.transform) != 'undefined')
						f.m_userData.domObj.style.transform = css_transform;
					else if (typeof(f.m_userData.domObj.style.webkitTransform) != 'undefined')
						f.m_userData.domObj.style.webkitTransform = css_transform;
					else if (typeof(f.m_userData.domObj.style.mozTransform) != 'undefined')
						f.m_userData.domObj.style.mozTransform = css_transform;
					else if (typeof(f.m_userData.domObj.style.msTransform) != 'undefined')
						f.m_userData.domObj.style.msTransform = css_transform;
					else if (typeof(f.m_userData.domObj.style.oTransform) != 'undefined')
						f.m_userData.domObj.style.oTransform = css_transform;
					
					if (f.m_userData.domObj.style.display == 'none') f.m_userData.domObj.style.display = '';
				}
			}
		}
	};

	//Method for animating
	function update(ts) {
		updateMouseDrag();

		world.Step(
			1 / 60 //frame-rate
			, 10 //velocity iterations
			, 10 //position iterations
		);

		//If you experience strange results, enable the debug drawing
		if (debug) {
			world.DrawDebugData();
		}

		drawDOMObjects();

		world.ClearForces();
		
		requestAnimFrame(update);
	}
   
	//Keep the canvas size correct for debug drawing
	function resizeHandler() {
		canvas.setAttribute('width', document.documentElement.offsetWidth);
		canvas.setAttribute('height', document.documentElement.offsetHeight);
	}
	
	
	
    var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
    var canvasPosition = getElementPosition(document.getElementById(canvas_id));

    var mouse = MouseAndTouch(document, downHandler, upHandler, moveHandler);
    
    function downHandler(x,y) {
       isMouseDown = true;
       moveHandler(x,y);
    }
    
    function upHandler(x,y) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
    }
    
    function moveHandler(x,y) {
       mouseX = (x - canvasPosition.x) / 30;
       mouseY = (y - canvasPosition.y) / 30;
    }
    
    function getBodyAtMouse() {
       mousePVec = new b2Vec2(mouseX, mouseY);
       var aabb = new b2AABB();
       aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
       aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
       
       // Query the world for overlapping shapes.

       selectedBody = null;
       world.QueryAABB(getBodyCB, aabb);
       return selectedBody;
    }

    function getBodyCB(fixture) {
       if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
          if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
             selectedBody = fixture.GetBody();
             return false;
          }
       }
       return true;
    }

    function getElementPosition(element) {
       var elem=element, tagname="", x=0, y=0;
      
       while(elem != null && typeof(elem) == "object" && typeof(elem.tagName) != "undefined") {
          y += elem.offsetTop;
          x += elem.offsetLeft;
          tagname = elem.tagName.toUpperCase();

          if(tagname == "BODY")
             elem=0;

          if(typeof(elem) == "object") {
             if(typeof(elem.offsetParent) == "object")
                elem = elem.offsetParent;
          }
       }

       return {x: x, y: y};
    }


    function updateMouseDrag() {
       if(isMouseDown && (!mouseJoint)) {
          var body = getBodyAtMouse();
          if(body) {
             var md = new b2MouseJointDef();
             md.bodyA = world.GetGroundBody();
             md.bodyB = body;
             md.target.Set(mouseX, mouseY);
             md.collideConnected = true;
             md.maxForce = 300.0 * body.GetMass();
             mouseJoint = world.CreateJoint(md);
             body.SetAwake(true);
          }
       }
       
       if(mouseJoint) {
          if(isMouseDown) {
             mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
          } else {
             world.DestroyJoint(mouseJoint);
             mouseJoint = null;
          }
       }
    }
}
