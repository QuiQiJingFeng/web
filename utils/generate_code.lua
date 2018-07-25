local ActiveCode = {}

function ActiveCode:Init()
	self.__dict = { 'A','B','C','D','E','F','G','H','J',
    'K','M','N','P','Q','R','S','T','U',
    'V','W','X','Y','Z',
    '1','2','3','4','5','6','7','8','9' }
    self.__codeLength = 8  --激活码的长度
    self.__codeStep = 5    --激活码的批次
    math.randomseed(tostring(os.time()):reverse():sub(1, 6))  
end
-- rewardId 取值范围是 0-2^5 - 1 [0-31] 即只能生成 31个批次的激活码
function ActiveCode:GenerateCodeValue(rewardId)
	local codeValue = 0
	local chars = {}
	for i= 0,self.__codeLength - 2 do
		local  key = math.random(#self.__dict)
		codeValue = codeValue | key << (self.__codeStep * i)
		table.insert(chars,self.__dict[key])
	end
	codeValue = codeValue | rewardId << (self.__codeStep * self.__codeLength)
	table.insert(chars,self.__dict[rewardId])
	return codeValue,table.concat(chars)
end

function ActiveCode:ParseCodeToRewardId(codeValue)
	local rewardId 
	while(codeValue > 0) do
		rewardId = codeValue & (2^self.__codeStep - 1)
		codeValue = codeValue >> self.__codeStep
	end
	return rewardId
end

ActiveCode:Init()

local code_list = {}
for i=1,100 do
	local codeValue,codeChar = ActiveCode:GenerateCodeValue(21)
	table.insert(code_list,codeChar)
end

local content = table.concat(code_list,"\n")
local file = io.open("./code.txt","wb")
file:write(content)
file:close()


--[[
	mysql -uroot --local-infile --登陆的时候必须显示指定
	load data local infile "/Users/jingfeng/SKYNET/console/views/code.txt" into table code_list(code);
]]




