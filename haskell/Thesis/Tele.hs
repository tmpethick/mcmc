module Thesis.Tele where
import Control.Monad.Free
import Control.Monad.State
import Control.Monad.Writer

data TeletypeF a = 
               PutLine String a
             | GetLine (String -> a)

instance Functor TeletypeF where
    fmap f (PutLine str x)  = PutLine str (f x)
    fmap f (GetLine      k) = GetLine (f . k)

getLine' :: Free TeletypeF String
getLine' = liftF $ GetLine id

putLine' :: String -> Free TeletypeF ()
putLine' l = liftF $ PutLine l ()

pop :: State [String] String
pop = state $ \(x:xs) -> (x, xs)

interpret :: Free TeletypeF a -> WriterT [String] (State [String]) a
interpret = iterM $ \x -> case x of
          PutLine l k -> tell [l] >> k
          GetLine k   -> (lift pop) >>= k

test = do
    l <- getLine'
    putLine' "output1"
    putLine' l

program = interpret test

expected = ((((),["output1","input1"]),["input2"]))
result = expected == runState (runWriterT program) ["input1", "input2"]
